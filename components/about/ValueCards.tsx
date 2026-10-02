"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/** The company values as four framed cards that fade up one after another as the grid scrolls into view. */
export function ValueCards({ values }: { values: { title: string; description: string }[] }) {
  const grid = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = grid.current;
      if (!el || prefersReducedMotion()) return;
      gsap.from(el.children, {
        opacity: 0,
        y: 32,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        // clearProps hands `translate` back to CSS afterwards, so the hover lift keeps working.
        clearProps: "opacity,transform,translate",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    },
    { scope: grid }
  );

  return (
    <div ref={grid} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {values.map((value, i) => (
        <article
          key={value.title}
          className="group relative flex h-full flex-col border border-ink/12 bg-paper px-8 py-10 transition-[border-color,translate] duration-300 hover:-translate-y-1 hover:border-gold"
        >
          <span aria-hidden className="absolute left-3 top-3 h-3 w-3 border-l border-t border-gold" />
          <span aria-hidden className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-gold" />
          <span className="mono-stat text-sm tracking-[0.2em] text-gold-deep">{String(i + 1).padStart(2, "0")}</span>
          {/* 32px gold line that grows to 64px on hover (scaled, so only a transform animates). */}
          <span
            aria-hidden
            className="mt-6 block h-px w-16 origin-left scale-x-50 bg-gold transition-transform duration-500 group-hover:scale-x-100"
          />
          <h3 className="mt-6 font-display text-[26px] leading-tight">{value.title}</h3>
          <p className="mt-3 text-base leading-relaxed text-ink/70">{value.description}</p>
        </article>
      ))}
    </div>
  );
}
