"use client";

import { useLayoutEffect, useRef } from "react";

const DURATION = 1600;

type Figure = { value: string; label: string };

/**
 * "Изградени на доверба": large numbers, each with a short rule and its label. The first is the years since the
 * company was founded (this year minus `founded`): the server HTML holds the final number, and when half of the row is
 * on screen it counts up from 0 in 1.6s (ease-out cubic), once. With reduced motion it stays as rendered.
 */
export function Numbers({ founded, figures }: { founded: number; figures: Figure[] }) {
  const root = useRef<HTMLDivElement>(null);
  const years = useRef<HTMLDivElement>(null);
  const initial = new Date().getFullYear() - founded;

  useLayoutEffect(() => {
    const block = root.current;
    const n = years.current;
    if (!block || !n || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = new Date().getFullYear() - founded;
    n.textContent = "0";
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / DURATION);
        n.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.5 }
    );
    io.observe(block);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [founded]);

  const numberClass = "font-display text-[clamp(56px,6.5vw,100px)] leading-[0.9] text-on-chrome";
  const numberStyle = { fontVariantNumeric: "lining-nums tabular-nums" } as const;

  return (
    <div ref={root} className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
      <div className="flex flex-col gap-3">
        <div ref={years} suppressHydrationWarning className={numberClass} style={numberStyle}>
          {initial}
        </div>
        <div aria-hidden className="h-px w-12 bg-accent" />
        <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-on-chrome/70">Години искуство</div>
      </div>
      {figures.map((figure) => (
        <div key={figure.label} className="flex flex-col gap-3">
          <div className={numberClass} style={numberStyle}>
            {figure.value}
          </div>
          <div aria-hidden className="h-px w-12 bg-accent" />
          <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-on-chrome/70">{figure.label}</div>
        </div>
      ))}
    </div>
  );
}
