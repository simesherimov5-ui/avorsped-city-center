"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/** How much of the section must be on screen before the animation plays. */
const ENTER = 0.45;

/**
 * The frame of «Во што веруваме» (components/home/Manifest.tsx): it only plays the section's entrance, once. The section is
 * fully visible as the server sends it (and with reduced motion, without scripts, or if the observer never fires). Only
 * when the script has a way to see the section come in does it arm it (`data-arm`: the marks, the lines, the eyebrow, the
 * words and the signature start hidden), and when 45% of the section is on screen it lets go (`data-go`): the CSS in
 * globals.css (.mf-stage) plays the whole sequence from that one attribute. A section that is already on screen when the
 * page opens (a reload part way down) is not armed: it just shows.
 */
export function ManifestStage({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    // already (mostly) on screen: nothing to wait for
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const shown = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    if (shown >= ENTER * Math.min(r.height, vh)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        // 45% of the section, or (for a section taller than the screen allows) 45% of the screen
        const enough =
          entry.intersectionRatio >= ENTER || entry.intersectionRect.height >= ENTER * entry.rootBounds!.height;
        if (!entry.isIntersecting || !enough) return;
        el.setAttribute("data-go", "");
        observer.disconnect();
      },
      { threshold: [0, 0.1, 0.2, 0.3, ENTER] }
    );
    el.setAttribute("data-arm", "");
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.removeAttribute("data-arm");
      el.removeAttribute("data-go");
    };
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
