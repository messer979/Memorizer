"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import LookupProvider from "./LookupProvider";

type Mode = "read" | "blur" | "initials";

/** Strip the most common inline markdown so memorize views read cleanly. */
function stripMarkdown(line: string): string {
  return line
    .replace(/[*_`]/g, "")
    .replace(/^#+\s*/, "")
    .replace(/^>\s?/, "")
    .trim();
}

/** Replace each word with its first character: "Whose woods" -> "W… w…". */
function toInitials(line: string): string {
  return line.replace(/\b([A-Za-z])[A-Za-z'’-]*/g, "$1…");
}

export default function Reader({
  content,
  lookupLang,
}: {
  content: string;
  /** When set, enables click-to-look-up in read mode (e.g. "la" for Latin). */
  lookupLang?: string;
}) {
  const [mode, setMode] = useState<Mode>("read");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const lines = useMemo(() => content.split("\n"), [content]);

  function toggleLine(i: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function setModeAndReset(m: Mode) {
    setMode(m);
    setRevealed(new Set());
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted mr-1">Mode:</span>
        {(
          [
            ["read", "Read"],
            ["blur", "Blur"],
            ["initials", "First letters"],
          ] as [Mode, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setModeAndReset(value)}
            className={`rounded-full border px-3 py-1 transition-colors ${
              mode === value
                ? "border-accent bg-accent text-background"
                : "border-border text-muted hover:border-accent hover:text-accent"
            }`}
            aria-pressed={mode === value}
          >
            {label}
          </button>
        ))}
        {mode !== "read" && (
          <span className="ml-auto text-xs text-muted">
            Tap a line to reveal it
          </span>
        )}
        {mode === "read" && lookupLang && (
          <span className="ml-auto text-xs text-muted">
            Double-click a word to look it up
          </span>
        )}
      </div>

      {mode === "read" ? (
        lookupLang ? (
          <LookupProvider lang={lookupLang}>
            <div className="verse text-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {content}
              </ReactMarkdown>
            </div>
          </LookupProvider>
        ) : (
          <div className="verse text-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {content}
            </ReactMarkdown>
          </div>
        )
      ) : (
        <div className="text-lg leading-[1.9]">
          {lines.map((raw, i) => {
            const clean = stripMarkdown(raw);
            const isBlank = clean === "";
            const isRevealed = revealed.has(i);

            if (isBlank) return <div key={i} className="h-5" aria-hidden />;

            const display =
              isRevealed || mode === "blur"
                ? clean
                : toInitials(clean);

            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleLine(i)}
                className="block w-full text-left rounded px-1 hover:bg-card"
              >
                <span
                  className={
                    mode === "blur" && !isRevealed
                      ? "blur-sm select-none transition-[filter]"
                      : "transition-[filter]"
                  }
                >
                  {display}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
