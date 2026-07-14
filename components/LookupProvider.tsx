"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface WhitakersResult {
  analysis: string;
  gloss?: string;
}
interface WiktionaryEntry {
  lang: string;
  language: string;
  partOfSpeech: string;
  definitions: string[];
}
interface DefineResponse {
  word: string;
  query: string;
  lang: string;
  found: boolean;
  whitakers: WhitakersResult | null;
  wiktionary: WiktionaryEntry[];
}

interface Anchor {
  word: string;
  x: number;
  y: number;
}

/**
 * Wraps a block of text. When the reader selects (or double-clicks) a word
 * inside it, a "Look up" button appears; clicking it fetches a definition
 * from /api/define and shows it in a popover. Built for Latin (lang="la"),
 * which resolves inflected forms via Whitaker's Words.
 */
export default function LookupProvider({
  lang = "la",
  children,
}: {
  lang?: string;
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DefineResponse | null>(null);

  const dismiss = useCallback(() => {
    setAnchor(null);
    setOpen(false);
    setResult(null);
  }, []);

  // Detect a selection inside the wrapper and place the trigger button.
  useEffect(() => {
    function onSelect() {
      // Don't clobber an open result popover.
      if (open) return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setAnchor(null);
        return;
      }
      const text = sel.toString().trim();
      const wrapper = wrapperRef.current;
      // Require: non-empty, single word-ish, and inside our wrapper.
      const anchorNode = sel.anchorNode;
      if (!wrapper || !text || !anchorNode || !wrapper.contains(anchorNode)) {
        setAnchor(null);
        return;
      }
      // Only offer lookup for a single word.
      if (/\s/.test(text)) {
        setAnchor(null);
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setAnchor({
        word: text,
        x: rect.left + rect.width / 2,
        y: rect.bottom,
      });
    }

    document.addEventListener("mouseup", onSelect);
    document.addEventListener("touchend", onSelect);
    document.addEventListener("selectionchange", onSelect);
    return () => {
      document.removeEventListener("mouseup", onSelect);
      document.removeEventListener("touchend", onSelect);
      document.removeEventListener("selectionchange", onSelect);
    };
  }, [open]);

  // Dismiss on Escape or scroll.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismiss]);

  async function lookup() {
    if (!anchor) return;
    setOpen(true);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/define?word=${encodeURIComponent(anchor.word)}&lang=${encodeURIComponent(lang)}`,
      );
      const data = (await res.json()) as DefineResponse;
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      {children}

      {anchor && !open && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // keep the text selection alive
          onClick={lookup}
          style={{
            position: "fixed",
            left: anchor.x,
            top: anchor.y + 8,
            transform: "translateX(-50%)",
            zIndex: 50,
          }}
          className="rounded-full bg-accent px-3 py-1 text-sm text-background shadow-lg"
        >
          Look up “{anchor.word}”
        </button>
      )}

      {open && anchor && (
        <>
          {/* click-away layer */}
          <div className="fixed inset-0 z-40" onClick={dismiss} aria-hidden />
          <div
            role="dialog"
            aria-label={`Definition of ${anchor.word}`}
            style={{
              position: "fixed",
              left: Math.min(Math.max(anchor.x, 180), globalThis.innerWidth - 180),
              top: anchor.y + 8,
              transform: "translateX(-50%)",
              zIndex: 50,
              maxWidth: "min(22rem, 90vw)",
            }}
            className="w-[22rem] rounded-lg border border-border bg-card p-4 shadow-xl"
          >
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <span className="font-semibold">{anchor.word}</span>
              <button
                type="button"
                onClick={dismiss}
                className="text-muted hover:text-accent text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {loading && <p className="text-sm text-muted">Looking up…</p>}

            {!loading && result && <LookupBody result={result} />}

            {!loading && !result && (
              <p className="text-sm text-muted">
                Lookup failed. Check your connection and try again.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function LookupBody({ result }: { result: DefineResponse }) {
  if (!result.found) {
    return (
      <p className="text-sm text-muted">
        No definition found for “{result.query}”.
      </p>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto text-sm leading-relaxed">
      {result.whitakers && (
        <div className="mb-3">
          {result.whitakers.gloss && (
            <p className="mb-1">{result.whitakers.gloss}</p>
          )}
          <details className="text-muted">
            <summary className="cursor-pointer select-none text-xs uppercase tracking-wide">
              Full parse (Whitaker&apos;s Words)
            </summary>
            <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">
              {result.whitakers.analysis}
            </pre>
          </details>
        </div>
      )}

      {result.wiktionary.slice(0, 3).map((entry, i) => (
        <div key={`${entry.lang}-${i}`} className="mb-3">
          <p className="text-xs uppercase tracking-wide text-muted mb-1">
            {entry.language}
            {entry.partOfSpeech ? ` · ${entry.partOfSpeech}` : ""}
          </p>
          <ul className="list-disc pl-4 space-y-1">
            {entry.definitions.slice(0, 4).map((d, j) => (
              <li key={j}>{d}</li>
            ))}
          </ul>
        </div>
      ))}

      <p className="mt-1 text-[11px] text-muted">
        Sources: Whitaker&apos;s Words · Wiktionary
      </p>
    </div>
  );
}
