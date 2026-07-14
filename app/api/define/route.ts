import { NextResponse } from "next/server";

/**
 * Dictionary lookup proxy.
 *
 * For Latin (lang=la) it queries William Whitaker's Words, which parses an
 * *inflected* form (e.g. "spiritui") back to its dictionary headword and
 * reports the grammar (case/tense/mood). Whitaker's is an HTTP, plain-text
 * academic endpoint with no CORS, which is exactly why this runs server-side.
 *
 * Wiktionary's REST API is used as a fallback (and as the primary source for
 * non-Latin words). It returns clean JSON grouped by language.
 *
 * The route never throws to the client: on any upstream failure it returns
 * 200 with whatever it managed to gather, so the UI can degrade gracefully.
 */

export const runtime = "nodejs";

const TIMEOUT_MS = 6000;

interface WhitakersResult {
  /** Cleaned, human-readable analysis block from Whitaker's Words. */
  analysis: string;
  /** A concise one-line gloss pulled from the analysis, if we could find one. */
  gloss?: string;
}

interface WiktionaryEntry {
  lang: string;
  language: string;
  partOfSpeech: string;
  definitions: string[];
}

/** Strip anything that isn't a letter (keeps the clicked token dictionary-clean). */
function normalizeWord(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // drop macrons/accents
    .replace(/[^A-Za-zÀ-ÿ]/g, "")
    .trim();
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function stripHtml(html: string): string {
  const pre = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  const body = pre ? pre[1] : html;
  return body
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

async function lookupWhitakers(word: string): Promise<WhitakersResult | null> {
  const url = `http://archives.nd.edu/cgi-bin/wordz.pl?keyword=${encodeURIComponent(word)}`;
  let res: Response;
  try {
    res = await fetchWithTimeout(url);
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const text = stripHtml(await res.text());
  if (!text) return null;
  // Whitaker's reports failures with these markers.
  if (/^========|UNKNOWN|No match/im.test(text) && !/\[[A-Z]{5}\]/.test(text)) {
    return null;
  }

  const lines = text
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .filter((l) => l.trim() !== "" && !l.startsWith("*"));

  // A gloss line is a lowercase-ish sentence without a Whitaker POS code.
  const gloss = lines.find(
    (l) => /[a-z]/.test(l) && !/\[[A-Z]{5}\]/.test(l) && /[a-z].*[;,]|^\s*[a-z]/.test(l.trim()),
  );

  return {
    analysis: lines.join("\n"),
    gloss: gloss?.trim(),
  };
}

const WIKTIONARY_LANG_NAMES: Record<string, string> = {
  la: "Latin",
  en: "English",
};

async function lookupWiktionary(
  word: string,
  preferLang: string,
): Promise<WiktionaryEntry[]> {
  const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`;
  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      headers: { "User-Agent": "Memorizer/1.0 (Latin study app)" },
    });
  } catch {
    return [];
  }
  if (!res.ok) return [];

  let data: Record<string, unknown>;
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    return [];
  }

  const entries: WiktionaryEntry[] = [];
  for (const [lang, groups] of Object.entries(data)) {
    if (!Array.isArray(groups)) continue;
    for (const group of groups as Array<Record<string, unknown>>) {
      const defs = (group.definitions as Array<{ definition?: string }> | undefined) ?? [];
      const cleaned = defs
        .map((d) => stripHtml(String(d.definition ?? "")))
        .filter(Boolean);
      if (cleaned.length === 0) continue;
      entries.push({
        lang,
        language: (group.language as string) || WIKTIONARY_LANG_NAMES[lang] || lang,
        partOfSpeech: (group.partOfSpeech as string) || "",
        definitions: cleaned,
      });
    }
  }

  // Put the preferred language first.
  entries.sort((a, b) => {
    if (a.lang === preferLang && b.lang !== preferLang) return -1;
    if (b.lang === preferLang && a.lang !== preferLang) return 1;
    return 0;
  });

  return entries;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("word") ?? "";
  const lang = searchParams.get("lang") ?? "la";
  const word = normalizeWord(raw);

  if (!word) {
    return NextResponse.json({ error: "No word provided." }, { status: 400 });
  }

  const [whitakers, wiktionary] = await Promise.all([
    lang === "la" ? lookupWhitakers(word) : Promise.resolve(null),
    lookupWiktionary(word.toLowerCase(), lang),
  ]);

  const found = Boolean(whitakers) || wiktionary.length > 0;

  return NextResponse.json(
    { word, query: raw, lang, found, whitakers, wiktionary },
    {
      headers: {
        // Cache aggressively — a word's definition doesn't change.
        "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
      },
    },
  );
}
