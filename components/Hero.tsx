"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { CountUp } from "@/components/ui/CountUp";
import { useIntro } from "@/components/intro/Preloader";
import { companyStats } from "@/data";
import { gsap, SplitText } from "@/lib/gsap";

// A company-wide hero, not a single-project pitch: the portfolio holds
// several developments and this is their shared front door.
const HERO_IMAGE = {
  src: "/images/exteriors/exterior-hero-wide.jpg",
  alt: "Јавор Шпед — архитектонска визуелизација",
  isPlaceholder: false,
};

export function Hero() {
  const reduceMotion = useReducedMotion();
  const { ready, instant } = useIntro();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  // The photo drifts slightly slower than the scroll (classic parallax depth)
  // but only across the hero's own height — it settles the instant the next
  // section starts, so it never reaches into content below.
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "14%"]);

  // Entrance timeline — separate from the Framer parallax/Ken-Burns above, on
  // their own DOM nodes, so the two engines never fight over the same
  // element's transform. Gated on the preloader: `ready` false means still
  // preloading (stay hidden); `instant` true means the intro was skipped
  // (repeat visit this session) so we snap straight to the final state.
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const ctaFrameRef = useRef<SVGRectElement>(null);
  const statsBarRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ready) return;
      const targets = [imageWrapRef.current, eyebrowRef.current, headlineRef.current, actionsRef.current, statsBarRef.current, scrollIndicatorRef.current];
      if (targets.some((t) => !t)) return;

      const split = new SplitText(headlineRef.current, { type: "lines", mask: "lines", linesClass: "line" });
      const frameLength = ctaFrameRef.current?.getTotalLength() ?? 0;
      if (ctaFrameRef.current) {
        gsap.set(ctaFrameRef.current, { strokeDasharray: frameLength, strokeDashoffset: frameLength });
      }

      if (instant) {
        gsap.set(imageWrapRef.current, { scale: 1, opacity: 1 });
        gsap.set(eyebrowRef.current, { opacity: 1, y: 0 });
        gsap.set(split.lines, { yPercent: 0 });
        gsap.set(actionsRef.current, { opacity: 1, y: 0 });
        gsap.set(statsBarRef.current, { opacity: 1, y: 0 });
        gsap.set(scrollIndicatorRef.current, { opacity: 1, y: 0 });
        if (ctaFrameRef.current) gsap.set(ctaFrameRef.current, { strokeDashoffset: 0 });
        return () => split.revert();
      }

      gsap.set(imageWrapRef.current, { scale: 1.2, opacity: 0.7 });
      gsap.set(eyebrowRef.current, { opacity: 0, y: 12 });
      gsap.set(split.lines, { yPercent: 110 });
      gsap.set(actionsRef.current, { opacity: 0, y: 16 });
      gsap.set(statsBarRef.current, { opacity: 0, y: 16 });
      gsap.set(scrollIndicatorRef.current, { opacity: 0, y: 16 });

      const tl = gsap.timeline();
      tl.to(imageWrapRef.current, { scale: 1, opacity: 1, duration: 2, ease: "power3.out" }, 0)
        .to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0)
        .to(split.lines, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power4.out" }, 0.3)
        .to(actionsRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 1.1)
        .to(ctaFrameRef.current, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" }, 1.3)
        .to(statsBarRef.current, { opacity: 1, y: 0, duration: 0.7 }, 1.5)
        .to(scrollIndicatorRef.current, { opacity: 1, y: 0, duration: 0.7 }, 1.7);

      return () => {
        split.revert();
        tl.kill();
      };
    },
    { scope: sectionRef, dependencies: [ready, instant] }
  );

  return (
    <section ref={sectionRef} className="relative flex h-[100svh] min-h-[640px] flex-col overflow-hidden bg-ink text-paper">
      <motion.div style={{ y: photoY }} className="absolute inset-0">
        <div ref={imageWrapRef} className="h-full w-full">
          {/* Settle-in on load, then an almost imperceptible continuous drift —
              a restrained Ken Burns effect rather than a looping video, so the
              architecture reads as a still photograph that's quietly alive.
              Skipped entirely under reduced-motion: it's decorative, not
              informational, so there's nothing to preserve by keeping it. */}
          <motion.div
            animate={reduceMotion ? undefined : { scale: [1, 1.045, 1] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
            className="h-full w-full"
          >
            {/* Focal point pinned toward the top: the source photo only has
                sky down to about 35% of its own height before the tallest
                roofline starts, and object-cover's default centered crop
                throws part of that away on any viewport wider than the
                photo's own ~16:9 (cropping equally off the top and bottom).
                Anchoring near the top instead keeps the full sky band and
                crops the parking lot at the bottom, which nothing here needs. */}
            <Media
              image={HERO_IMAGE}
              tone="dark"
              className="h-full w-full [&_img]:object-[50%_12%]"
              priority
              sizes="100vw"
            />
          </motion.div>
        </div>

        {/*
          Ink gradient overlay for text legibility (the design system's rule
          for UI over photography), shaped to the actual photo rather than a
          flat veil: sampling the source photo's luminance in the top 45% of
          the frame under a simulated object-fit:cover crop at 1440×760,
          768×900 and 390×740 found a consistently bright ~150–195/255 sky at
          every size, so `.hero-scrim` concentrates its darkening there
          instead, tapering to near-zero over the building and easing back in
          slightly behind the stats strip at the very bottom.
        */}
        <div className="hero-scrim absolute inset-0" />
        <div className="hero-scrim-radial absolute inset-0" />
      </motion.div>

      {/* Sky text — the eyebrow and headline sit in the cloud band right
          below the nav, not stamped over the building. Kept deliberately
          compact (small top offset, tight eyebrow-to-headline gap): the
          photo only has ~35% of its own height as clear sky before the
          tallest roofline, so the whole block has to fit well inside that
          on short/wide viewports, not just the tall ones. */}
      <div
        className="relative px-6 pt-16 text-center sm:pt-20 lg:pt-24"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.55), 0 4px 20px rgba(0,0,0,0.4)" }}
      >
        <div ref={eyebrowRef} className="eyebrow text-gold">
          Exclusive Building · Основано 1994
        </div>

        <div
          ref={headlineRef}
          className="mx-auto mt-3 max-w-2xl text-lg font-medium uppercase leading-tight tracking-[0.14em] text-paper sm:text-2xl sm:tracking-[0.2em] lg:text-3xl"
        >
          Добредојдовте во вашиот нов дом
        </div>
      </div>

      {/* Actions — grounded near the bottom, separate from the headline. */}
      <div className="relative flex flex-1 flex-col items-center justify-end px-6 pb-14 text-center sm:pb-16">
        <div ref={actionsRef} className="flex flex-wrap justify-center gap-4">
          <span className="relative inline-flex">
            <Button href="/projects" variant="primary">Погледни ги проектите</Button>
            {/* Gold frame that draws in around the primary CTA as it settles — a
                decorative entrance flourish, independent of the button's own
                permanent gold fill. */}
            <svg className="pointer-events-none absolute -inset-1.5" aria-hidden>
              <rect
                ref={ctaFrameRef}
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="1"
              />
            </svg>
          </span>
          <Button href="/consultation" variant="secondary" tone="dark">Закажи консултација</Button>
        </div>
      </div>

      {/* Company footprint — real, portfolio-wide numbers, not one project's. */}
      <div ref={statsBarRef} className="relative border-t border-line-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 py-4 text-center text-[10px] uppercase tracking-[0.2em] text-paper/55 sm:flex-row sm:justify-between sm:px-10 sm:text-left sm:text-[11px]">
          <span>Струмица, Северна Македонија</span>
          <span className="flex items-center gap-3 sm:gap-5">
            <span>
              <span className="mono-stat text-gold">
                {instant ? companyStats[0].value : ready ? <CountUp value={companyStats[0].value} /> : null}
              </span>{" "}
              {companyStats[0].label}
            </span>
            <span className="h-3 w-px bg-line-dark" aria-hidden />
            <span>
              <span className="mono-stat text-gold">
                {instant ? companyStats[1].value : ready ? <CountUp value={companyStats[1].value} /> : null}
              </span>{" "}
              {companyStats[1].label}
            </span>
            <span className="hidden h-3 w-px bg-line-dark sm:block" aria-hidden />
            <span className="hidden sm:inline">
              <span className="mono-stat text-gold">
                {instant ? companyStats[2].value : ready ? <CountUp value={companyStats[2].value} /> : null}
              </span>{" "}
              {companyStats[2].label}
            </span>
          </span>
        </div>
      </div>

      {/* Scroll indicator — a thin gold line pulsing downward in a loop. */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-28 right-6 flex flex-col items-center gap-3 text-paper/45 sm:bottom-20 lg:right-10"
      >
        <span className="relative h-9 w-px overflow-hidden bg-line-dark">
          <motion.span
            animate={reduceMotion ? undefined : { y: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="absolute inset-x-0 h-1/2 bg-gold"
          />
        </span>
      </div>
    </section>
  );
}
