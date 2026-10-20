"use client";

import { useEffect, useRef, useState } from "react";
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
  { media: "(min-width: 1280px)", w: COLUMN_WIDE, h: `min(${COLUMN_WIDE}, calc(100svh - 192px), 640px)` },
  { media: "(min-width: 900px)", w: COLUMN_NARROW, h: `min(${COLUMN_NARROW}, calc(100svh - 192px), 640px)` },
  { w: "100vw", h: "62.5vw" },
];

/**
 * «Што нè разликува»: from 900px a photo stays in place on the left while the four points scroll past on the right; the
 * point crossing the middle of the screen is the active one (full strength, the rest dimmed) and its photo is the one
 * shown. Under 900px there is no sticky photo and no dimming: every point carries its own photo above it. The photos are
 * decorative (empty alt): the titles carry the meaning. The dimming is armed by the script, so without scripts all four
 * texts are at full strength.
 */
export function DifferencesStage({ items }: { items: DifferenceItem[] }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.setAttribute("data-armed", "");
    const points = [...el.querySelectorAll<HTMLElement>("[data-df-point]")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(points.indexOf(entry.target as HTMLElement));
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    points.forEach((point) => observer.observe(point));
    return () => {
      observer.disconnect();
      el.removeAttribute("data-armed");
    };
  }, []);

  return (
    <div ref={root} className="df">
      <div className="df-col">
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
                    sizes="100vw"
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
