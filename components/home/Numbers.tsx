"use client";

import { useLayoutEffect, useRef } from "react";
import { StatCell, STAT_GRID } from "@/components/ui/StatCell";

const DURATION = 1600;

/** A whole number that counts up (with an optional suffix), or a text that is shown as it is (a range, a year, a [bracket]). */
export type NumberItem = { label: string } & ({ target: number; suffix?: string } | { text: string });
type Figure = { target: number; suffix?: string; label: string };

/** 8000 becomes "8.000": the thousands separator is written by hand so the server and the browser agree. */
const format = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** What the row shows: the page's own `items`, or the years since `founded` (from the visitor's own clock) and `figures`. */
const buildItems = (founded: number, figures: Figure[], items?: NumberItem[]): NumberItem[] =>
  items ?? [{ target: new Date().getFullYear() - founded, label: "Години искуство" }, ...figures];

const written = (item: NumberItem) => ("text" in item ? item.text : format(item.target) + (item.suffix ?? ""));

/**
 * "Изградени на доверба": large numbers, each with a short rule and its label. On Почетна the first is the years since
 * the company was founded (this year minus `founded`) and `figures` follow it; any other page gives its own `items`
 * (and its `className` for the grid). The server HTML holds every final number, and when half of the row is on screen
 * the whole numbers all count up from 0 in 1.6s (ease-out cubic), once; a text item stays as written. With reduced
 * motion they stay as rendered.
 */
export function Numbers({
  founded = 0,
  figures = [],
  items,
  className = STAT_GRID,
}: {
  founded?: number;
  figures?: Figure[];
  items?: NumberItem[];
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const cells = useRef<(HTMLSpanElement | null)[]>([]);
  const shown = buildItems(founded, figures, items);

  useLayoutEffect(() => {
    const block = root.current;
    if (!block || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const now = buildItems(founded, figures, items);
    const show = (i: number, value: number) => {
      const el = cells.current[i];
      const item = now[i];
      if (el && "target" in item) el.textContent = format(value) + (item.suffix ?? "");
    };
    now.forEach((_, i) => show(i, 0));

    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const tick = (time: number) => {
        const p = Math.min(1, (time - t0) / DURATION);
        const eased = 1 - Math.pow(1 - p, 3);
        now.forEach((item, i) => "target" in item && show(i, Math.round(item.target * eased)));
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
  }, [founded, figures, items]);

  return (
    <div ref={root} className={className}>
      {shown.map((item, i) => (
        <StatCell key={item.label} label={item.label}>
          <span
            ref={(el) => {
              cells.current[i] = el;
            }}
            suppressHydrationWarning
          >
            {written(item)}
          </span>
        </StatCell>
      ))}
    </div>
  );
}
