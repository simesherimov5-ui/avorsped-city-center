"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/motion/Reveal";
import { aspectOf, coverSizes } from "@/lib/image-sizes";

export type DifferenceItem = {
  title: string;
  text: string;
  /** The photo of the point, its description, and where in it the architecture sits (object-position, in percent). */
  photo: { src: string; alt: string; x: number; y: number };
};

// The width of the photo column (5fr of 5fr + 6fr, a 72px gap, the 1200px container) and so the width of the 4:3 frame.
const COLUMN_WIDE = "513px";
const COLUMN_NARROW = "calc((100vw - 152px) * 0.4545)";
const FRAMES = [
  { media: "(min-width: 1280px)", w: COLUMN_WIDE, h: `calc(${COLUMN_WIDE} * 0.75)` },
  { media: "(min-width: 1024px)", w: COLUMN_NARROW, h: `calc(${COLUMN_NARROW} * 0.75)` },
  // under 1024px the frame is not shown: this layout is never fetched (the phone photo has its own sizes below)
  { w: "100vw", h: "75vw" },
];
// The phone photo: the page's width less its side padding (the photo is shown whole, at its own proportions).
const PHONE_SIZES = "(min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)";

/**
 * «Што нè разликува»: from 1024px the heading and a 4:3 photo stay in place on the left (one sticky block, below the
 * bar) while the four points scroll past on the right. A point is active while it crosses the middle of the window
 * (an IntersectionObserver on each point, so no scroll listener): its photo is the one shown and its text is at full
 * strength, the others dimmed (never under 4.5:1, see globals.css). Scrolling back up switches back the same way. Under
 * 1024px nothing is sticky or dimmed: the heading, then every point as a pair, its photo (at its own proportions) above
 * its number, title and text. The dimming is armed by the script, so without scripts all four texts are at full strength.
 */
export function DifferencesStage({ heading, items }: { heading: ReactNode; items: DifferenceItem[] }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const points = [...el.querySelectorAll<HTMLElement>("[data-df-point]")];
    // A zero-height root at the middle of the window: a point intersects it while it crosses that line.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!desktop.matches) return;
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(points.indexOf(entry.target as HTMLElement));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    points.forEach((point) => observer.observe(point));
    el.setAttribute("data-armed", "");
    return () => {
      observer.disconnect();
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
              <div
                key={item.title}
                className={i === active ? "df-photo is-active" : "df-photo"}
                aria-hidden={i === active ? undefined : true}
              >
                <Media
                  image={{ src: item.photo.src, alt: item.photo.alt, isPlaceholder: false }}
                  focus={{ zoom: 1, x: item.photo.x, y: item.photo.y }}
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
                <div
                  className="df-pic"
                  style={{ "--a": (aspectOf(item.photo.src) ?? 4 / 3).toFixed(4) } as CSSProperties}
                >
                  <Media
                    image={{ src: item.photo.src, alt: item.photo.alt, isPlaceholder: false }}
                    focus={{ zoom: 1, x: item.photo.x, y: item.photo.y }}
                    alwaysCover
                    className="h-full w-full !bg-transparent"
                    sizes={PHONE_SIZES}
                  />
                </div>
                <div className="df-num eyebrow text-gold-deep">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="df-title font-display text-[length:calc(clamp(22px,2vw,28px)*var(--type-scale,1))] font-normal leading-[1.3]">
                  {item.title}
                </h3>
                <p className="df-text max-w-[44ch] text-[length:min(calc(14px*var(--type-scale,1)),var(--body-max,999px))] font-normal leading-[1.7] text-ink/[0.72]">
                  {item.text}
                </p>
              </div>
            </Reveal>
          </div>
        ))}
      </div>
    </div>
  );
}
