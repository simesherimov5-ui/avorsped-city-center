"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useIntro } from "@/components/intro/IntroProvider";

const THUMB = 20;
/** A page that scrolls by less than this has no indicator. */
const MIN_SCROLL = 40;

/**
 * One quiet vertical scroll indicator in the right gutter of every page, mounted once in the layout: a hairline track with a
 * short thumb that slides from the top to the bottom as the page scrolls. Decorative only. The thumb moves by transform. Its
 * position is recomputed in a frame after each scroll (and every frame while the page is still moving), on resize, when the
 * page's height or the visible height changes (a phone's browser bar) and on a new page. It is hidden on a page that does not
 * really scroll, and during the homepage opening.
 */
export function ScrollIndicator() {
  const { ready } = useIntro();
  const pathname = usePathname();
  const cue = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cue.current;
    const rail = track.current;
    const knob = thumb.current;
    if (!ready || !el || !rail || !knob) return;

    let frame = 0;
    let idle = 0;
    let lastKey = "";
    let railHeight = rail.clientHeight;
    const viewport = window.visualViewport;
    // The visible height: on a phone it changes as the browser's bar slides away and back. Pinch-zoomed it is smaller
    // than the page's own viewport, which would put the end of the page out of reach, so then the plain height is used.
    const viewHeight = () => (viewport && Math.abs(viewport.scale - 1) < 0.01 ? viewport.height : window.innerHeight);
    const update = () => {
      const doc = document.documentElement;
      const height = viewHeight();
      const max = doc.scrollHeight - height;
      el.hidden = max <= MIN_SCROLL;
      const y = window.scrollY;
      // at the real end of the page the thumb is at the end, whatever the bar is doing
      const atEnd = y >= doc.scrollHeight - window.innerHeight - 1;
      const progress = atEnd ? 1 : Math.min(1, Math.max(0, y / Math.max(max, 1)));
      knob.style.transform = `translateY(${progress * Math.max(railHeight - THUMB, 0)}px)`;
      return `${y}|${height}|${doc.scrollHeight}`;
    };
    // One frame after a scroll, and then every frame until the page has been still for a few frames: a finger's momentum
    // scroll can report fewer scroll events than frames, and the thumb must not wait for the next one.
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
    const onResize = () => {
      railHeight = rail.clientHeight; // 72px, 56px on phones
      schedule();
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    viewport?.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      viewport?.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [ready, pathname]);

  if (!ready) return null;
  return (
    <div ref={cue} className="scroll-cue" aria-hidden="true">
      <div ref={track} className="scroll-cue__track">
        <div ref={thumb} className="scroll-cue__thumb" />
      </div>
    </div>
  );
}
