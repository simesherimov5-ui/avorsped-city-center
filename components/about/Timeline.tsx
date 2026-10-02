"use client";

import { useRef, type PointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Milestone = { year: string; text: string };

/**
 * Horizontal company timeline: milestones on one gold line with gold dots. The line draws left to right as
 * it scrolls into view and the milestones fade up; when there are more than fit, the row scrolls sideways
 * (swipe on touch, drag with a mouse, thin gold scrollbar). Sits on an ink background.
 */
export function Timeline({ milestones }: { milestones: Milestone[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const items = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !line.current || !items.current || !scroller.current) return;
      const trigger = { trigger: scroller.current, start: "top 85%", once: true } as const;
      gsap.from(line.current, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.4,
        ease: "power3.inOut",
        scrollTrigger: trigger,
      });
      gsap.from(items.current.children, {
        opacity: 0,
        y: 24,
        duration: 0.8,
        stagger: 0.18,
        delay: 0.3,
        ease: "power3.out",
        scrollTrigger: trigger,
      });
    },
    { scope: scroller }
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !scroller.current) return;
    drag.current = { x: e.clientX, left: scroller.current.scrollLeft };
    scroller.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current && scroller.current)
      scroller.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
  };
  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div
      ref={scroller}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      tabIndex={0}
      role="region"
      aria-label="Нашиот пат"
      className="gold-scrollbar focus-ring cursor-grab overflow-x-auto pb-4 active:cursor-grabbing"
    >
      <div className="relative min-w-max pt-1">
        <div ref={line} aria-hidden className="absolute left-0 right-0 top-1 h-px bg-gold/50" />
        <div ref={items} className="flex">
          {milestones.map((m) => (
            <div key={m.year + m.text} className="relative w-[260px] shrink-0 pr-7 pt-8">
              <span aria-hidden className="absolute left-0 top-[-1px] h-[9px] w-[9px] rounded-full bg-gold" />
              <div className="mono-stat text-[30px] leading-none text-gold" style={{ letterSpacing: 0 }}>
                {m.year}
              </div>
              <p className="mt-3 text-base leading-relaxed text-paper/75">{m.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
