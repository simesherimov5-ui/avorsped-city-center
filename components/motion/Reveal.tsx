"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { CALM_EASE, DUR, gsap, prefersReducedMotion } from "@/lib/gsap";
import { REVEAL_START } from "@/lib/motion";

/**
 * GSAP ScrollTrigger fade+slide reveal, homepage-only — the site's other
 * pages keep using the existing Framer-Motion `components/ui/Reveal.tsx`
 * (same name, different folder: this one is GSAP, that one Framer).
 */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (prefersReducedMotion()) {
        gsap.set(ref.current, { opacity: 1, y: 0 });
        return;
      }

      // Lighter on phones: shorter travel, shorter duration. It starts as soon as the top of the block is inside the
      // bottom 5% of the screen, so nothing sits invisible on screen waiting for it.
      const phone = window.innerWidth < 768;
      gsap.set(ref.current, { opacity: 0, y: phone ? 12 : 24 });
      gsap.to(ref.current, {
        opacity: 1,
        y: 0,
        duration: phone ? DUR.base : DUR.slow,
        delay,
        ease: CALM_EASE,
        scrollTrigger: {
          trigger: ref.current,
          start: REVEAL_START,
          once: true,
        },
      });
    },
    { scope: ref, dependencies: [delay] }
  );

  return <div ref={ref}>{children}</div>;
}
