"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Side-effect only — renders nothing, wraps nothing. Lenis runs against the
 * default window scroller rather than a wrapper div, so it can't interfere
 * with the position:sticky/fixed elements already used throughout the site
 * (navbar, apartment-filter sidebars, the apartment detail page's sticky
 * aside). Skipped entirely under reduced motion: inertia smoothing is itself
 * a motion effect, not just a convenience.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
