"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/motion/Reveal";
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
 * The heading on the container's edge, then a sticky portrait photo beside the four values in a 2 × 2 grid. A row's title
 * and top line turn gold on hover. With one photo per value the photos crossfade (0.5s) as the rows are hovered or
 * scrolled through.
 */
export function Values({ eyebrow, heading, values, images }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const photoBox = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const several = images.length > 1;

  // Several photos: the one for the row that is crossing the middle of the screen shows.
  useGSAP(
    () => {
      const el = root.current;
      if (!el || !several || prefersReducedMotion()) return;
      el.querySelectorAll<HTMLElement>("[data-row]").forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
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
          duration: prefersReducedMotion() ? 0 : 0.5,
          ease: "power2.inOut",
        })
      );
    },
    { scope: photoBox, dependencies: [active, several] }
  );

  return (
    <div ref={root}>
      <div className="bk-eyebrow">{eyebrow}</div>
      <RevealHeading as="h2" className="bk-h2 bk-serif">
        {heading}
      </RevealHeading>
      <div className="ab-duo">
        <Reveal className="ab-duo-photo-wrap">
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
        </Reveal>

        <div className="ab-values">
          {values.map((value, i) => (
            <Reveal key={value.title} delay={0.08 * (i % 2)}>
              <article
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
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
