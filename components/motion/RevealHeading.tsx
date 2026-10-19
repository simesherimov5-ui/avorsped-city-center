"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { CALM_EASE, DUR, gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { REVEAL_START } from "@/lib/motion";

/**
 * A heading whose lines rise into view one after another (masked, so each line slides out from behind its
 * own baseline) when it scrolls into view. Hidden from the first paint and shown by the animation, so it
 * never flashes; with reduced motion it is simply shown.
 */
export function RevealHeading({
  as: Tag = "h2",
  className,
  children,
  duration = DUR.slow,
  ease = CALM_EASE,
  from = 110,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Seconds each line takes to rise. */
  duration?: number;
  ease?: string;
  /** Starting offset of a line, in % of its own height. */
  from?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap.set(el, { autoAlpha: 0 });
      let split: SplitText | undefined;
      let cancelled = false;
      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
      (fonts ? fonts.ready : Promise.resolve()).then(() => {
        if (cancelled) return;
        split = new SplitText(el, { type: "lines", mask: "lines", linesClass: "reveal-line" });
        gsap.set(split.lines, { yPercent: from });
        gsap.set(el, { autoAlpha: 1 });
        gsap.to(split.lines, {
          yPercent: 0,
          duration,
          stagger: 0.05,
          ease,
          scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
        });
      });
      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: ref, dependencies: [duration, ease, from] }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
