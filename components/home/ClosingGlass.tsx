"use client";

import "./closing-glass.css";
import { useEffect, useRef, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { MARK_STROKES, MARK_VIEWBOX } from "@/lib/logo-mark";

/**
 * Where each line of the building starts drawing, in seconds, and how long it takes. The order comes from where the
 * line is on the building (the frame and the centre line first, then the floors from the ground up, the right line of
 * a floor 0.05s after its left one), not from the `delay` of the opening, which is a different order.
 */
const FLOOR_START = 0.3;
const FLOOR_STEP = 0.06;
const PAIR_GAP = 0.05;

const numbers = (d: string) => (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

const LINES = (() => {
  const tall = MARK_STROKES.filter((s) => s.d.includes("V"));
  const floors = MARK_STROKES.filter((s) => !s.d.includes("V"));
  // the lowest point of a floor's line is its position; the two lines of a floor share it
  const bottomOf = (d: string) => Math.max(...numbers(d).filter((_, i) => i % 2 === 1));
  const levels = [...new Set(floors.map((s) => bottomOf(s.d)))].sort((a, b) => b - a);
  return [
    ...tall.map((s, i) => ({ ...s, start: i * 0.08, duration: i === 0 ? 0.9 : 0.85 })),
    ...floors.map((s) => {
      const right = numbers(s.d)[0] > 100;
      return {
        ...s,
        start: FLOOR_START + levels.indexOf(bottomOf(s.d)) * FLOOR_STEP + (right ? PAIR_GAP : 0),
        duration: 0.5,
      };
    }),
  ];
})();

/**
 * The ending of the homepage: the building mark drawn in thin gold lines, a pane of dark glass in front of it, and the
 * call to action on the glass. The server HTML is the finished section. When the visitor has not reached it yet, the
 * script hides the parts and plays the entrance once, as 40% of the section comes on screen (building, then glass, then
 * the text); with scripts off, with reduced motion, or when the section is already on screen on load, nothing is hidden.
 */
export function ClosingGlass({ phone, email }: { phone: string; email: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    // The first report says where the section is right now. On screen already (the visitor landed here): it stays as
    // it is, finished. Off screen: hide the parts, and play the entrance once when 40% of it comes into view.
    let armed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!armed) {
          armed = true;
          if (entry.isIntersecting) return observer.disconnect();
          el.classList.add("cg-armed");
          return;
        }
        if (entry.intersectionRatio < 0.4) return;
        el.classList.add("cg-in");
        observer.disconnect();
      },
      { threshold: [0, 0.4] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={root} className="cg" aria-labelledby="cg-title">
      <div className="cg-glow" aria-hidden />

      <svg className="cg-mark" viewBox={MARK_VIEWBOX} aria-hidden>
        <defs>
          <linearGradient id="cg-gold" gradientUnits="userSpaceOnUse" x1="60" y1="300" x2="200" y2="62">
            <stop className="cg-s0" offset="0" />
            <stop className="cg-s1" offset="0.4" />
            <stop className="cg-s2" offset="1" />
          </linearGradient>
        </defs>
        {LINES.map((line) => (
          <path
            key={line.d}
            d={line.d}
            pathLength={1}
            opacity={line.opacity}
            style={{ "--d": `${line.start}s`, "--t": `${line.duration}s` } as CSSProperties}
          />
        ))}
      </svg>

      <div className="cg-glass">
        <div className="eyebrow text-accent">Следен чекор</div>
        <h2 className="cg-title" id="cg-title">
          Вашето следно поглавје <em>започнува тука.</em>
        </h2>
        <p className="cg-lead">Нашиот тим ќе ви помогне да го најдете вистинскиот стан.</p>
        <div className="cg-actions">
          <Button href="/contact" variant="primary" tone="dark" filled>
            Закажи консултација
          </Button>
          <Button href="/projects" variant="secondary" tone="dark">
            Погледни ги проектите
          </Button>
        </div>
        <div className="cg-contact">
          <a href={`tel:${phone.replace(/ /g, "")}`} className="focus-ring">
            {phone}
          </a>
          <i aria-hidden />
          <a href={`mailto:${email}`} className="focus-ring">
            {email}
          </a>
        </div>
      </div>
    </section>
  );
}
