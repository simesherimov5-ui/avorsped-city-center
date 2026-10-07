"use client";

import { useLayoutEffect, useRef } from "react";

const DURATION = 1600;

/**
 * "Години градиме": the number of years since the company was founded (this year minus `founded`), in Playfair, with a
 * 1px line under it that fills in step with the count and the label under that. The server HTML already holds the final
 * number and a full line; when at least half of the block is on screen the number counts up from 0 to it in 1.6s
 * (ease-out cubic) and the line fills with it, once. With reduced motion it stays as rendered. The surface is light, so
 * the accent is Бронза and the number Оникс.
 */
export function YearCounter({ founded }: { founded: number }) {
  const root = useRef<HTMLDivElement>(null);
  const number = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  // Rendered once for the server HTML; the animation recomputes from the visitor's own clock.
  const initial = new Date().getFullYear() - founded;

  useLayoutEffect(() => {
    const block = root.current;
    const n = number.current;
    const bar = fill.current;
    if (!block || !n || !bar || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = new Date().getFullYear() - founded;
    n.textContent = "0";
    bar.style.width = "0%";

    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / DURATION);
        const eased = 1 - Math.pow(1 - p, 3);
        n.textContent = String(Math.round(target * eased));
        bar.style.width = `${eased * 100}%`;
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

  return (
    <div ref={root} className="mx-auto flex w-full max-w-xl flex-col items-center gap-3.5">
      <div
        ref={number}
        suppressHydrationWarning
        className="font-display text-onyx"
        style={{
          fontSize: "clamp(88px, 9vw, 120px)",
          lineHeight: 1,
          fontVariantNumeric: "lining-nums tabular-nums",
        }}
      >
        {initial}
      </div>
      <div className="relative h-px w-full bg-onyx/12">
        <span ref={fill} className="absolute left-0 top-0 h-px bg-bronze" style={{ width: "100%" }} />
      </div>
      <div className="pl-[0.32em] text-center text-[11px] font-semibold uppercase tracking-[0.32em] text-bronze">
        Години градиме · од {founded}
      </div>
    </div>
  );
}
