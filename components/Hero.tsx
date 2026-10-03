"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Media } from "@/components/ui/Media";
import { CountUp } from "@/components/ui/CountUp";
import { useIntro } from "@/components/intro/IntroProvider";
import { companyStats } from "@/data";
import { gsap, SplitText } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";

// A company-wide hero, not a single-project pitch: the portfolio holds
// several developments and this is their shared front door.
const HERO_IMAGE = {
  src: "/images/exteriors/exterior-hero-wide.jpg",
  alt: "Јавор Шпед — архитектонска визуелизација",
  isPlaceholder: false,
};

// The strip's numbers read first: gold, IBM Plex Mono at weight 400 and 16px (the .mono-stat class is lighter and
// more widely spaced, so these override it).
const STAT_NUMBER = { fontWeight: 400, fontSize: "16px", letterSpacing: "0.02em" } as const;

export function Hero() {
  const reduceMotion = useReducedMotion();
  const isPhone = useMediaQuery("(max-width: 767px)");
  const { revealing, instant } = useIntro();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  // The photo drifts slightly slower than the scroll (classic parallax depth)
  // but only across the hero's own height — it settles the instant the next
  // section starts, so it never reaches into content below.
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion || isPhone ? "0%" : "14%"]);

  // One entrance, tied to the opening. The photo is never animated here: it is
  // already fully loaded and visible under the black screen, which simply
  // opens over it. The text and stats stay hidden until the screen starts to
  // open (`revealing`), then come in; mounting after the intro is over
  // (navigating back to the homepage) just shows the final state. The Framer
  // parallax above only reacts to scrolling and runs on its own DOM node.
  const revealedAtMount = useRef(revealing);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const statsBarRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const eyebrow = eyebrowRef.current;
      const headline = headlineRef.current;
      const stats = statsBarRef.current;
      const scrollCue = scrollIndicatorRef.current;
      if (!eyebrow || !headline || !stats || !scrollCue) return;

      if (!revealing) {
        gsap.set([eyebrow, headline, stats, scrollCue], { opacity: 0 });
        gsap.set([eyebrow, stats, scrollCue], { y: 14 });
        return;
      }

      if (instant || revealedAtMount.current) {
        gsap.set([eyebrow, headline, stats, scrollCue], { opacity: 1, y: 0 });
        return;
      }

      const split = new SplitText(headline, { type: "lines", mask: "lines", linesClass: "line" });
      gsap.set(split.lines, { yPercent: 110 });
      gsap.set(headline, { opacity: 1 });

      const tl = gsap.timeline();
      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.6 }, 0.1)
        .to(split.lines, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power4.out" }, 0.3)
        .to(stats, { opacity: 1, y: 0, duration: 0.7 }, 1.1)
        .to(scrollCue, { opacity: 1, y: 0, duration: 0.7 }, 1.3);

      return () => {
        split.revert();
        tl.kill();
      };
    },
    { scope: sectionRef, dependencies: [revealing, instant] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[100dvh] min-h-[560px] flex-col overflow-hidden bg-ink text-paper"
    >
      <motion.div style={{ y: photoY }} className="absolute inset-0">
        {/* No entrance animation on the photo itself. data-hero-image marks it so the
            opening can wait until it is loaded before the black screen opens. */}
        <div data-hero-image className="h-full w-full">
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
        {/* A top scrim under the navbar and the eyebrow: ink at 70% (55% fell just short of 4.5:1 on phones) fading to nothing over the top 180px, so the
            gold eyebrow and the nav links read against the sky. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[180px] bg-gradient-to-b from-ink/70 to-ink/0"
        />
      </motion.div>

      {/* A dark scrim behind the info strip: ink fading in from nothing at the top of its 240px to 80% at the
          bottom, above the photo and under the text, so the strip's labels always sit on the dark part. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[240px] bg-gradient-to-b from-ink/0 to-ink/80 max-sm:to-ink/90"
      />

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
          className="mx-auto mt-3 max-w-2xl text-[clamp(1.25rem,5.6vw,1.5rem)] font-medium uppercase leading-tight tracking-[0.06em] text-paper sm:text-2xl sm:tracking-[0.2em] lg:text-3xl"
        >
          Добредојдовте во вашиот нов дом
        </div>
      </div>

      {/* Spacer that keeps the stats strip pinned to the bottom of the hero. */}
      <div className="flex-1" />

      {/* Company footprint — real, portfolio-wide numbers, not one project's. */}
      <div ref={statsBarRef} className="relative border-t border-paper/35">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-5 py-4 text-center text-[12px] font-medium uppercase tracking-[0.24em] text-paper sm:flex-row sm:justify-between sm:px-10 sm:text-left sm:text-[13px]">
          <span>Струмица, Северна Македонија</span>
          <span className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:flex-nowrap sm:justify-end sm:gap-5">
            <span>
              <span className="mono-stat text-gold" style={STAT_NUMBER}>
                {instant ? companyStats[0].value : revealing ? <CountUp value={companyStats[0].value} /> : null}
              </span>{" "}
              {companyStats[0].label}
            </span>
            <span className="h-3 w-px bg-gold/60 max-sm:hidden" aria-hidden />
            <span>
              <span className="mono-stat text-gold" style={STAT_NUMBER}>
                {instant ? companyStats[1].value : revealing ? <CountUp value={companyStats[1].value} /> : null}
              </span>{" "}
              {companyStats[1].label}
            </span>
            <span className="hidden h-3 w-px bg-gold/60 sm:block" aria-hidden />
            <span className="hidden sm:inline">
              <span className="mono-stat text-gold" style={STAT_NUMBER}>
                {instant ? companyStats[2].value : revealing ? <CountUp value={companyStats[2].value} /> : null}
              </span>{" "}
              {companyStats[2].label}
            </span>
          </span>
        </div>
      </div>

      {/* Scroll indicator — a thin gold line pulsing downward in a loop. */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-28 right-6 flex flex-col items-center gap-3 text-paper/62 sm:bottom-20 lg:right-10"
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
