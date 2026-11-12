"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";

/** Where the reveal starts and ends, as a share of the visible height: the paragraph's top at 85%, its bottom past 70%. */
const START = 0.85;
const END = 0.7;
/** The words of a text, split at the spaces: the punctuation stays attached to its word. */
const splitWords = (text: string) => text.split(/\s+/).filter(Boolean);

/**
 * The paragraph of «Во што веруваме»: one <p>, one <span> per word. The server (and a browser without scripts or with
 * reduced motion) shows it in full Оникс. Once the script runs the words start grey and turn dark one after another, in
 * reading order, as the paragraph scrolls through the screen (word i is dark while i < progress × the number of words),
 * and grey again on the way back up (`.on` is only toggled, in a frame after a scroll). The 0.3s colour transition is
 * switched on a frame after the grey start, so nothing fades black → grey on load.
 */
export function ManifestText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = splitWords(text);

  useEffect(() => {
    const p = ref.current;
    if (!p || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spans = [...p.querySelectorAll<HTMLElement>(".mf-w")];
    const viewport = window.visualViewport;
    // the visible height: steady while a phone's browser bar slides (pinch-zoomed, the plain height is used)
    const viewHeight = () => (viewport && Math.abs(viewport.scale - 1) < 0.01 ? viewport.height : window.innerHeight);

    let frame = 0;
    let idle = 0;
    let lastKey = "";
    const update = () => {
      const vh = viewHeight();
      const r = p.getBoundingClientRect();
      const start = vh * START;
      const end = vh * END;
      const progress = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
      spans.forEach((s, i) => s.classList.toggle("on", i < progress * spans.length));
      return `${Math.round(r.top * 2)}|${Math.round(vh)}`;
    };
    // one frame after a scroll, and on until the page has been still for a few frames (a finger's momentum scroll)
    const tick = () => {
      frame = 0;
      const key = update();
      idle = key === lastKey ? idle + 1 : 0;
      lastKey = key;
      if (idle < 12) frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      idle = 0;
      if (!frame) frame = requestAnimationFrame(tick);
    };

    p.setAttribute("data-armed", "");
    update();
    const live = requestAnimationFrame(() => p.setAttribute("data-live", ""));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    viewport?.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(live);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      viewport?.removeEventListener("resize", schedule);
      p.removeAttribute("data-armed");
      p.removeAttribute("data-live");
      spans.forEach((s) => s.classList.remove("on"));
    };
  }, []);

  return (
    <p ref={ref} className={className ? `mf-text ${className}` : "mf-text"}>
      {words.map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          {/* .wd is the invisible line each word rises out of (ManifestStage), .wr the rising word, .mf-w its colour */}
          <span className="wd">
            <span className="wr" style={{ "--i": i } as CSSProperties}>
              <span className="mf-w">{word}</span>
            </span>
          </span>
        </Fragment>
      ))}
    </p>
  );
}
