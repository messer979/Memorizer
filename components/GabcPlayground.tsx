"use client";

import { useEffect, useState } from "react";
import ChantScore from "./ChantScore";

const STARTER = `(c4) Ky(f)ri(gh)e(h.) (,) e(hi)lé(h)i(gf)son.(f.) (::)`;

/** A textarea of gabc with a live rendering under it. */
export default function GabcPlayground({ initial = STARTER }: { initial?: string }) {
  const [source, setSource] = useState(initial);
  const [rendered, setRendered] = useState(initial);

  // Wait for a pause in typing before redrawing.
  useEffect(() => {
    const t = setTimeout(() => setRendered(source), 400);
    return () => clearTimeout(t);
  }, [source]);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <label htmlFor="gabc-playground" className="block text-sm text-muted mb-2">
        Edit the gabc and the chant redraws below
      </label>
      <textarea
        id="gabc-playground"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        spellCheck={false}
        rows={3}
        className="w-full rounded border border-border bg-background p-3 font-mono text-sm leading-relaxed focus:border-accent focus:outline-none"
      />
      <div className="mt-4">
        <ChantScore gabc={rendered} label="Your gabc, rendered" dropCap={false} />
      </div>
      <button
        type="button"
        onClick={() => setSource(initial)}
        className="mt-3 text-xs text-muted hover:text-accent transition-colors"
      >
        Reset example
      </button>
    </div>
  );
}
