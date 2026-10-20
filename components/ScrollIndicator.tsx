"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useIntro } from "@/components/intro/IntroProvider";

const THUMB = 20;
/** A page that scrolls by less than this has no indicator. */
const MIN_SCROLL = 40;

/**
 * One quiet vertical scroll indicator in the right gutter of every page, mounted once in the layout: a hairline track with a
 * short thumb that slides from the top to the bottom as the page scrolls. Decorative only. The thumb moves by transform; the
 * position is recomputed in a frame after each scroll, on resize, on a change of the page's height and on a new page. It is
 * hidden on a page that does not really scroll, and during the homepage opening.
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
    let railHeight = rail.clientHeight;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.hidden = max <= MIN_SCROLL;
      const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(max, 1)));
      knob.style.transform = `translateY(${progress * Math.max(railHeight - THUMB, 0)}px)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      railHeight = rail.clientHeight; // 72px, 56px on phones
      schedule();
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
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
