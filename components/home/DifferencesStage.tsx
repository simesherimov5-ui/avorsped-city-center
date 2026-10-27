"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/motion/Reveal";
import { coverSizes } from "@/lib/image-sizes";

export type DifferenceItem = {
  title: string;
  text: string;
  /** The photo of the point and where in it the building sits (object-position, in percent). */
  photo: { src: string; x: number; y?: number };
};

// The width of the photo column (5fr of 5fr + 6fr, a 72px gap, the 1200px container) and so the side of the square frame.
const COLUMN_WIDE = "513px";
const COLUMN_NARROW = "calc((100vw - 152px) * 0.4545)";
const FRAMES = [
  { media: "(min-width: 1280px)", w: COLUMN_WIDE, h: `min(${COLUMN_WIDE}, 640px)` },
  { media: "(min-width: 1024px)", w: COLUMN_NARROW, h: `min(${COLUMN_NARROW}, 640px)` },
  { w: "100vw", h: "62.5vw" },
];

/**
 * «Што нè разликува»: from 1024px the heading and a photo stay in place on the left (one sticky block) while the four
 * points scroll past on the right; the active point is the one whose middle is nearest the middle of the photo (full
 * strength, the rest dimmed) and its photo is the one shown. So the first point is active when the photo settles and the
 * last stays active until the block moves on. Under 1024px nothing is sticky or dimmed: the heading, then every point
 * with its own photo above it. The photos are decorative (empty alt): the titles carry the meaning. The dimming is armed
 * by the script, so without scripts all four texts are at full strength.
 */
export function DifferencesStage({ heading, items }: { heading: ReactNode; items: DifferenceItem[] }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const frame = el?.querySelector<HTMLElement>(".df-frame");
    if (!el || !frame) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const points = [...el.querySelectorAll<HTMLElement>("[data-df-point]")];
    let raf = 0;
    // Once per frame, reads only: the new active point reaches the page through React, after this frame's reads.
    const measure = () => {
      raf = 0;
      if (!desktop.matches) return;
      const f = frame.getBoundingClientRect();
      const middle = f.top + f.height / 2;
      let nearest = 0;
      let distance = Infinity;
      points.forEach((point, i) => {
        const r = point.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - middle);
        if (d < distance) {
          distance = d;
          nearest = i;
        }
      });
      setActive(nearest);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    el.setAttribute("data-armed", "");
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    desktop.addEventListener("change", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
      if (raf) cancelAnimationFrame(raf);
      el.removeAttribute("data-armed");
    };
  }, []);

  return (
    <div ref={root} className="df">
      <div className="df-col">
        <div className="df-stick">
          {heading}
          <div className="df-frame">
            {items.map((item, i) => (
              <div key={item.title} className={i === active ? "df-photo is-active" : "df-photo"}>
                <Media
                  image={{ src: item.photo.src, alt: "", isPlaceholder: false }}
                  focus={{ zoom: 1, x: item.photo.x, y: item.photo.y ?? 50 }}
                  alwaysCover
                  className="h-full w-full !bg-transparent"
                  sizes={coverSizes(item.photo.src, FRAMES)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="df-list">
        {items.map((item, i) => (
          <div key={item.title} data-df-point className={i === active ? "df-point is-active" : "df-point"}>
            <Reveal delay={i * 0.05}>
              <div className="df-inner">
                <div className="df-pic">
                  <Media
                    image={{ src: item.photo.src, alt: "", isPlaceholder: false }}
                    focus={{ zoom: 1, x: item.photo.x, y: item.photo.y ?? 50 }}
                    alwaysCover
                    className="h-full w-full !bg-transparent"
                    // under 1024px only (hidden above): the page's width less its side padding
                    sizes="(min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)"
                  />
                </div>
                <div className="eyebrow text-gold-deep">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="font-display text-[length:clamp(22px,2vw,28px)] font-normal leading-[1.3]">
                  {item.title}
                </h3>
                <p className="max-w-[44ch] text-[14px] font-normal leading-[1.7] text-ink/[0.72]">{item.text}</p>
              </div>
            </Reveal>
          </div>
        ))}
      </div>
    </div>
  );
}
