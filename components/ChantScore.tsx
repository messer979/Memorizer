"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders Gregorian chant in square notation from gabc, using exsurge
 * (https://github.com/bbloomf/exsurge, published as `exsurge-ts`).
 *
 * The score is laid out to the width of its container and redrawn when that
 * width changes or the color scheme flips, so it reflows on phones and
 * follows the site's light/dark theme.
 */
export default function ChantScore({
  gabc,
  label,
}: {
  gabc: string;
  /** Accessible name for the rendered score, e.g. the piece's title. */
  label?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [rubric, setRubric] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let renderId = 0;
    let lastWidth = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    async function render() {
      const id = ++renderId;
      const width = Math.floor(container!.clientWidth);
      if (width <= 0) return;
      lastWidth = width;

      try {
        // Loaded on demand: exsurge measures text in the DOM, so it only
        // runs in the browser, and only pages with chant pay for it.
        const [ex] = await Promise.all([
          import("exsurge-ts"),
          // The ℟/℣ font (see globals.css), so text is measured with it.
          document.fonts?.load("16px 'Exsurge Characters'").catch(() => {}),
        ]);
        if (cancelled || id !== renderId) return;

        const css = getComputedStyle(document.documentElement);
        const color = (name: string, fallback: string) =>
          css.getPropertyValue(name).trim() || fallback;
        const ink = color("--foreground", "#000");
        const rubricInk = color("--accent", "#a00");
        const paper = color("--background", "#fff");

        // Shrink everything a little on narrow screens.
        const scale = width < 520 ? 0.8 : 1;

        const ctxt = new ex.ChantContext();
        ctxt.defIdPrefix = "chant-";
        ctxt.textColor = ink;
        ctxt.setFont("Georgia, 'Times New Roman', serif", 18 * scale);
        ctxt.setGlyphScaling((1 / 16) * scale);
        ctxt.setRubricColor(rubricInk);
        ctxt.neumeLineColor = ink;
        ctxt.staffLineColor = ink;
        ctxt.dividerLineColor = ink;
        // The holes in hollow notes have to match the page behind them.
        ctxt.negativeFillColor = paper;

        const mappings = ex.Gabc.createMappingsFromSource(ctxt, gabc);
        const score = new ex.ChantScore(ctxt, mappings, true);
        const header = new ex.GabcHeader(gabc);
        ex.Gabc.applyHeader(score, ctxt, header);

        await new Promise<void>((resolve) =>
          score.performLayoutAsync(ctxt, () => resolve()),
        );
        if (cancelled || id !== renderId) return;
        await new Promise<void>((resolve) =>
          score.layoutChantLines(ctxt, width, () => resolve()),
        );
        if (cancelled || id !== renderId) return;

        const svg = score.createSvgNode(ctxt);
        svg.setAttribute("role", "img");
        if (label) svg.setAttribute("aria-label", label);
        svg.style.maxWidth = "100%";
        svg.style.height = "auto";
        container!.replaceChildren(svg);

        const headerRubric = (header as unknown as Record<string, unknown>)
          .rubric;
        setRubric(typeof headerRubric === "string" ? headerRubric : null);
        setStatus("ready");
      } catch (err) {
        console.error("Failed to render chant", err);
        if (!cancelled) setStatus("error");
      }
    }

    render();

    const resizeObserver = new ResizeObserver(() => {
      const width = Math.floor(container.clientWidth);
      if (Math.abs(width - lastWidth) < 8) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(render, 150);
    });
    resizeObserver.observe(container);

    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", render);

    return () => {
      cancelled = true;
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      scheme.removeEventListener("change", render);
    };
  }, [gabc, label]);

  return (
    <figure>
      <div ref={containerRef} className="chant-score w-full overflow-hidden" />
      {status === "loading" && (
        <p className="text-sm text-muted">Loading chant…</p>
      )}
      {status === "error" && (
        <p className="text-sm text-muted">
          Sorry, the chant notation couldn’t be drawn.
        </p>
      )}
      {status === "ready" && rubric && (
        <figcaption className="mt-4 text-sm italic text-muted">
          {rubric}
        </figcaption>
      )}
    </figure>
  );
}
