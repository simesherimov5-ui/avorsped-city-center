"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates the numeric prefix of a stat like "30+" or "540+" from 0 up to
 * its target once it scrolls into view, keeping any non-numeric suffix
 * static. Plays once; respects prefers-reduced-motion by rendering the
 * final value immediately instead of animating.
 */
export function CountUp({ value, pad = 0, duration = 1400 }: { value: string; pad?: number; duration?: number }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : value;

  const ref = useRef<HTMLSpanElement>(null);
  const [prefersReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [display, setDisplay] = useState(() => (prefersReducedMotion ? target : 0));

  useEffect(() => {
    const node = ref.current;
    if (!node || !match || prefersReducedMotion) return;

    let started = false;
    let frame: number;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (started || !entry.isIntersecting) return;
        started = true;
        observer.disconnect();

        const startTime = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * target));
          if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, duration, match, prefersReducedMotion]);

  return (
    <span ref={ref}>
      {match ? String(display).padStart(pad, "0") : null}
      {suffix}
    </span>
  );
}
