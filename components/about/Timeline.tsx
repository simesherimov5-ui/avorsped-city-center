"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { Plus } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/cn";
import { PhotoViewer } from "./PhotoViewer";

export type Milestone = { year: string; text: string; image?: { src: string; alt: string } };

/**
 * "Нашиот пат": a row of milestone cards (4:3 photo, the year in gold mono, one sentence). Four columns on
 * desktop; with more than four milestones the row becomes a scroll-snap strip you can drag or swipe, two
 * columns on tablets and one on phones. Each card is a button that opens the photo viewer.
 */
export function Timeline({ milestones }: { milestones: Milestone[] }) {
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const scrolls = milestones.length > 4;

  // Cards fade up one after another when the row scrolls in.
  useGSAP(
    () => {
      const el = list.current;
      if (!el || prefersReducedMotion()) return;
      gsap.set(el.children, { opacity: 0, y: 40 });
      gsap.to(el.children, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    },
    { scope: list }
  );

  return (
    <>
      <ul
        ref={list}
        className={cn("ab-strip", scrolls && "is-scroll")}
        onPointerDown={(e) => {
          if (!scrolls || e.pointerType !== "mouse" || !list.current) return;
          drag.current = { x: e.clientX, left: list.current.scrollLeft };
        }}
        onPointerMove={(e) => {
          if (drag.current && list.current) list.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
      >
        {milestones.map((m, i) => (
          <li key={m.year + m.text}>
            <button
              type="button"
              className="ab-card"
              aria-label={`${m.year}. ${m.text} — отвори ја фотографијата`}
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
            >
              <div className={cn("ab-card-photo", !m.image && "is-empty bk-mono")}>
                {m.image ? (
                  <>
                    <div className="ab-card-img">
                      <Media
                        image={{ ...m.image, isPlaceholder: false }}
                        tone="dark"
                        sizes="(max-width: 560px) 133vw, (max-width: 900px) 67vw, 34vw"
                        className="h-full w-full"
                      />
                    </div>
                    <div aria-hidden className="ab-card-veil" />
                    <span aria-hidden className="ab-card-plus">
                      <Plus className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                  </>
                ) : (
                  m.year
                )}
              </div>
              <span className="ab-card-year bk-mono">{m.year}</span>
              <p>{m.text}</p>
            </button>
          </li>
        ))}
      </ul>

      <PhotoViewer
        milestones={milestones}
        index={index}
        open={open}
        onIndex={setIndex}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
