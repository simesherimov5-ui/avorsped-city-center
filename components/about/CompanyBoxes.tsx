"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * The group's companies as boxes on an ink background, joined by shared thin gold lines (3 × 3 on desktop,
 * 2 columns on tablet, 1 on phones). The company this site belongs to is outlined in gold. The boxes reveal in a
 * diagonal wave as the grid scrolls into view.
 */
export function CompanyBoxes({
  companies,
  highlight,
  thisLabel,
}: {
  companies: string[];
  highlight: string;
  thisLabel: string;
}) {
  const grid = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const el = grid.current;
      if (!el || prefersReducedMotion()) return;
      gsap.from(el.children, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power3.out",
        stagger: { amount: 0.9, grid: "auto", from: "start" },
        clearProps: "opacity,transform,translate",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    },
    { scope: grid }
  );

  return (
    // gap-px over a gold/25 background draws the shared 1px lines between the boxes.
    <ul ref={grid} className="grid grid-cols-1 gap-px border border-gold/25 bg-gold/25 sm:grid-cols-2 lg:grid-cols-3">
      {companies.map((name, i) => {
        const isThis = name === highlight;
        return (
          <li
            key={name}
            // On two columns an odd last box stretches over the row, so no empty cell shows the line colour.
            className="group relative flex h-[88px] flex-col justify-between bg-ink p-5 transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--color-gold)_8%,var(--color-ink))] sm:h-[140px] sm:max-lg:last:odd:col-span-2"
          >
            {isThis && <span aria-hidden className="pointer-events-none absolute inset-0 border border-gold" />}
            <div className="flex items-start justify-between gap-3">
              <span className="mono-stat text-xs tracking-[0.2em] text-gold">{String(i + 1).padStart(2, "0")}</span>
              {isThis && (
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold">{thisLabel}</span>
              )}
            </div>
            <span
              className={`text-[15px] uppercase tracking-[0.2em] transition-colors duration-300 group-hover:text-gold ${isThis ? "text-gold" : "text-paper"}`}
            >
              {name}
            </span>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100"
            />
          </li>
        );
      })}
    </ul>
  );
}
