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
  const hasMatch = Boolean(match);

  const ref = useRef<HTMLSpanElement>(null);
  const [prefersReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [display, setDisplay] = useState(() => (prefersReducedMotion ? target : 0));

  useEffect(() => {
    const node = ref.current;
    if (!node || !hasMatch || prefersReducedMotion) return;

    let started = false;
    let intervalId: ReturnType<typeof setInterval>;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (started || !entry.isIntersecting) return;
        started = true;
        observer.disconnect();

        const startTime = Date.now();
        const tick = () => {
          const progress = Math.min((Date.now() - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * target));
          if (progress >= 1) clearInterval(intervalId);
        };
        intervalId = setInterval(tick, 16);
        tick();
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
    // `match` is a fresh array every render (String.match doesn't return a
    // stable reference) — depending on it directly would re-run this effect
    // on every render (including the ones triggered by our own setDisplay
    // ticks), resetting the count before it ever finishes. `hasMatch` and
    // `target` are the only derived values that matter and are stable.
  }, [target, duration, hasMatch, prefersReducedMotion]);

  return (
    <span ref={ref}>
      {hasMatch ? String(display).padStart(pad, "0") : null}
      {suffix}
    </span>
  );
}
