"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { CALM_EASE, DUR, gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { REVEAL_START } from "@/lib/motion";
import { Media } from "@/components/ui/Media";
import { RevealHeading } from "@/components/motion/RevealHeading";

type Image = { src: string; alt: string };

type Props = {
  eyebrow: string;
  heading: string;
  values: { title: string; description: string }[];
  /** One photo, or one per value: with several, the photo of the value that is hovered or in view shows. */
  images: Image[];
};

/**
 * A sticky portrait photo beside the four values. The list rows fade up one by one; a row's title and top
 * line turn gold on hover. With one photo per value the photos crossfade (0.5s) as the rows are hovered or
 * scrolled through.
 */
export function Values({ eyebrow, heading, values, images }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const photoBox = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const several = images.length > 1;

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const rows = el.querySelectorAll<HTMLElement>("[data-row]");
      gsap.set(rows, { opacity: 0, y: 24 });
      rows.forEach((row, i) => {
        gsap.to(row, {
          opacity: 1,
          y: 0,
          duration: DUR.slow,
          ease: CALM_EASE,
          delay: window.innerWidth < 900 ? 0 : 0.05 * (i % 2),
          scrollTrigger: { trigger: row, start: REVEAL_START, once: true },
        });
        // Several photos: the one for the row that is crossing the middle of the screen shows.
        if (several) {
          ScrollTrigger.create({
            trigger: row,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => self.isActive && setActive(i),
          });
        }
      });
      if (photoBox.current) {
        gsap.fromTo(
          photoBox.current,
          { opacity: 0, scale: 1.05 },
          {
            opacity: 1,
            scale: 1,
            duration: DUR.slow,
            ease: CALM_EASE,
            scrollTrigger: { trigger: photoBox.current, start: REVEAL_START, once: true },
          }
        );
      }
    },
    { scope: root, dependencies: [several] }
  );

  // Crossfade between the photos (0.5s).
  useGSAP(
    () => {
      if (!several || !photoBox.current) return;
      const layers = photoBox.current.querySelectorAll<HTMLElement>("[data-layer]");
      layers.forEach((layer, i) =>
        gsap.to(layer, {
          opacity: i === active ? 1 : 0,
          duration: prefersReducedMotion() ? 0 : DUR.slow,
          ease: CALM_EASE,
        })
      );
    },
    { scope: photoBox, dependencies: [active, several] }
  );

  return (
    <div ref={root} className="ab-duo">
      <div ref={photoBox} className="ab-duo-photo">
        {images.map((image, i) => (
          <div key={image.src} data-layer style={{ opacity: i === 0 ? 1 : 0 }}>
            <Media
              image={{ ...image, isPlaceholder: false }}
              tone="dark"
              defer
              sizes="(max-width: 900px) 133vw, 1150px"
              className="h-full w-full"
            />
          </div>
        ))}
      </div>

      <div>
        <div className="bk-eyebrow">{eyebrow}</div>
        <RevealHeading as="h2" className="bk-h2 bk-serif" from={115}>
          {heading}
        </RevealHeading>
        <div>
          {values.map((value, i) => (
            <article
              key={value.title}
              data-row
              className="ab-v"
              onPointerEnter={() => several && setActive(i)}
              onFocus={() => several && setActive(i)}
            >
              <span className="ab-v-n bk-mono">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
