"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { Media } from "@/components/ui/Media";
import { usePageReady } from "@/components/page-transition/PageTransition";

export type HeroStat = {
  /** A word before the number, e.g. "Од". */
  lead?: string;
  /** "1994", "540+", "6": the number counts up; anything after the digits stays still. */
  value: string;
  /** Text after the number, e.g. "изградени станови". */
  label?: string;
};

type Props = {
  image: { src: string; alt: string };
  eyebrow: string;
  /** The two lines of the headline; the second one is set in gold italic. */
  lines: [string, string];
  stats: HeroStat[];
};

/**
 * Full-bleed photo with the headline and a meta row at the bottom-left. On load the photo settles from
 * 1.08 to 1 while the eyebrow, the headline lines (masked reveal) and the meta row arrive, and the numbers
 * count up. It waits until the curtain has cleared, so it plays in view. With reduced motion it is simply shown.
 */
export function AboutHero({ image, eyebrow, lines, stats }: Props) {
  const root = useRef<HTMLElement>(null);
  const ready = usePageReady();

  useGSAP(
    () => {
      const el = root.current;
      if (!ready || !el || prefersReducedMotion()) return;
      const q = (selector: string) => el.querySelector<HTMLElement>(selector);
      const photo = q("[data-hero=photo]");
      const eyebrowEl = q("[data-hero=eyebrow]");
      const h1 = q("[data-hero=h1]");
      const meta = q("[data-hero=meta]");
      if (!photo || !eyebrowEl || !h1 || !meta) return;

      gsap.fromTo(photo, { scale: 1.08 }, { scale: 1, duration: 2.2, ease: "power3.out" });
      gsap.set([eyebrowEl, meta], { y: 14 });

      const tl = gsap.timeline({ paused: true });
      let split: SplitText | undefined;
      let cancelled = false;
      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
      (fonts ? fonts.ready : Promise.resolve()).then(() => {
        if (cancelled) return;
        split = new SplitText(h1, { type: "lines", mask: "lines", linesClass: "ab-line" });
        gsap.set(split.lines, { yPercent: 115 });
        gsap.set(h1, { opacity: 1 });

        tl.to(eyebrowEl, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.4)
          .to(split.lines, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power4.out" }, 0.7)
          .to(meta, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 1.6);

        // The numbers count up from their own starting point (the year from 1900, the rest from 0).
        el.querySelectorAll<HTMLElement>("[data-count]").forEach((num) => {
          const to = Number(num.dataset.count);
          const counter = { v: Number(num.dataset.from ?? 0) };
          num.textContent = String(Math.round(counter.v));
          tl.to(
            counter,
            {
              v: to,
              duration: 1.8,
              ease: "power2.out",
              onUpdate: () => {
                num.textContent = String(Math.round(counter.v));
              },
            },
            1.6
          );
        });
        tl.play();
      });

      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section ref={root} className="ab-hero">
      <div data-hero="photo" className="ab-hero-photo">
        <Media
          image={{ ...image, isPlaceholder: false }}
          priority
          sizes="100vw"
          tone="dark"
          className="h-full w-full"
        />
      </div>
      <div aria-hidden className="ab-hero-shade" />

      <div data-hero="eyebrow" className="bk-eyebrow ab-pre">
        {eyebrow}
      </div>
      <h1 data-hero="h1" className="bk-h1 bk-serif ab-pre">
        {lines[0]}
        <br />
        <em>{lines[1]}</em>
      </h1>
      <div data-hero="meta" className="ab-meta bk-mono ab-pre">
        {stats.map((stat) => {
          const match = stat.value.match(/^(\d+)(.*)$/);
          const digits = match ? match[1] : stat.value;
          const suffix = match ? match[2] : "";
          return (
            <span key={stat.value + (stat.label ?? "")}>
              {stat.lead && <>{stat.lead} </>}
              <b>
                {/* The number's width is reserved (monospace digits), so counting never shifts the row. */}
                <span
                  className="ab-num"
                  data-count={match ? digits : undefined}
                  data-from={digits.length === 4 ? 1900 : 0}
                  style={{ minWidth: `${digits.length}ch` }}
                >
                  {digits}
                </span>
                {suffix}
              </b>
              {stat.label && <> {stat.label}</>}
            </span>
          );
        })}
      </div>
    </section>
  );
}
