"use client";

import { Fragment, useEffect, useRef } from "react";

/** Where the reveal starts and ends, as a share of the visible height: the paragraph's top at 85%, its bottom past 40%. */
const START = 0.85;
const END = 0.4;
/** A sentence turns dark a little before its share of the progress is over: sentence i at (i + 0.3) / count. */
const LEAD = 0.3;

/** The sentences of a text (a full stop, !, ? or … ends one). Any number of them; the words are not changed. */
const splitSentences = (text: string) =>
  (text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text]).map((s) => s.trim()).filter(Boolean);

/**
 * The paragraph of «Во што веруваме»: one <p>, one <span> per sentence. The server (and a browser without scripts or with
 * reduced motion) shows it in full Оникс. Once the script runs the sentences start grey and turn dark one after another
 * as the paragraph scrolls through the screen, and grey again on the way back up (`.on` is only toggled, in a frame after
 * a scroll). The 0.9s colour transition is switched on a frame after the grey start, so nothing fades black → grey on load.
 */
export function ManifestText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const sentences = splitSentences(text);

  useEffect(() => {
    const p = ref.current;
    if (!p || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spans = [...p.querySelectorAll<HTMLElement>(".mf-s")];
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
      spans.forEach((s, i) => s.classList.toggle("on", progress > (i + LEAD) / spans.length));
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
      {sentences.map((sentence, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="mf-s">{sentence}</span>
        </Fragment>
      ))}
    </p>
  );
}
