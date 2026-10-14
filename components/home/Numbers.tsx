"use client";

import { useLayoutEffect, useRef } from "react";

const DURATION = 1600;

type Figure = { target: number; suffix?: string; label: string };

/** 8000 becomes "8.000": the thousands separator is written by hand so the server and the browser agree. */
const format = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/**
 * "Изградени на доверба": large numbers, each with a short rule and its label. The first is the years since the
 * company was founded (this year minus `founded`); `figures` follow it. The server HTML holds every final number, and
 * when half of the row is on screen they all count up from 0 in 1.6s (ease-out cubic), once. With reduced motion they
 * stay as rendered.
 */
export function Numbers({ founded, figures }: { founded: number; figures: Figure[] }) {
  const root = useRef<HTMLDivElement>(null);
  const cells = useRef<(HTMLSpanElement | null)[]>([]);
  const yearsNow = new Date().getFullYear() - founded;
  const items: Figure[] = [{ target: yearsNow, label: "Години искуство" }, ...figures];

  useLayoutEffect(() => {
    const block = root.current;
    if (!block || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The years are counted from the visitor's own clock; the other figures are fixed.
    const targets = [new Date().getFullYear() - founded, ...figures.map((f) => f.target)];
    const suffixes = ["", ...figures.map((f) => f.suffix ?? "")];
    const show = (i: number, value: number) => {
      const el = cells.current[i];
      if (el) el.textContent = format(value) + suffixes[i];
    };
    targets.forEach((_, i) => show(i, 0));

    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / DURATION);
        const eased = 1 - Math.pow(1 - p, 3);
        targets.forEach((target, i) => show(i, Math.round(target * eased)));
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
  }, [founded, figures]);

  return (
    <div ref={root} className="grid gap-9 sm:grid-cols-3 sm:gap-8 lg:gap-12">
      {items.map((item, i) => (
        <div key={item.label} className="flex flex-col gap-3">
          <div
            className="font-display text-(length:--fs-hero) leading-[0.95] text-accent"
            style={{ fontVariantNumeric: "lining-nums tabular-nums" }}
          >
            <span
              ref={(el) => {
                cells.current[i] = el;
              }}
              suppressHydrationWarning
            >
              {format(item.target)}
              {item.suffix}
            </span>
          </div>
          <div aria-hidden className="h-px w-12 bg-accent" />
          <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
