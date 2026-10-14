"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { useIntro } from "@/components/intro/IntroProvider";
import { gsap, SplitText } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";

// A company-wide hero, not a single-project pitch: the portfolio holds
// several developments and this is their shared front door.
const HERO_IMAGE = {
  src: "/images/exteriors/exterior-hero-wide.jpg",
  alt: "Јавор Шпед — архитектонска визуелизација",
  isPlaceholder: false,
};

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
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const statsBarRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const eyebrow = eyebrowRef.current;
      const headline = headlineRef.current;
      const stats = statsBarRef.current;
      const lead = leadRef.current;
      const actions = actionsRef.current;
      if (!eyebrow || !headline || !stats || !lead || !actions) return;
      const rest = [lead, actions];

      if (!revealing) {
        gsap.set([eyebrow, headline, stats, ...rest], { opacity: 0 });
        gsap.set([eyebrow, stats, ...rest], { y: 14 });
        return;
      }

      if (instant || revealedAtMount.current) {
        gsap.set([eyebrow, headline, stats, ...rest], { opacity: 1, y: 0 });
        return;
      }

      const split = new SplitText(headline, { type: "lines", mask: "lines", linesClass: "line" });
      gsap.set(split.lines, { yPercent: 110 });
      gsap.set(headline, { opacity: 1 });

      const tl = gsap.timeline();
      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.6 }, 0.1)
        .to(split.lines, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power4.out" }, 0.3)
        .to(rest, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0.9)
        .to(stats, { opacity: 1, y: 0, duration: 0.7 }, 1.2);

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
            sizes="(max-width: 767px) 160vw, 100vw"
          />
        </div>

        {/* One scrim shaped for the text over the photo: Оникс 60% at the top (under the navigation) and at the bottom (under
            the strip), about 30% where the text sits, so the building stays visible and the text always reads. */}
        <div aria-hidden className="hero-scrim absolute inset-0" />
      </motion.div>

      {/* The text: in the middle of the space between the navigation and the strip at the bottom, centred. */}
      <div
        className="container-x relative flex flex-1 flex-col items-center justify-center pb-10 pt-[76px] text-center"
        style={{
          textShadow:
            "0 1px 3px color-mix(in srgb, var(--color-onyx) 55%, transparent), 0 4px 20px color-mix(in srgb, var(--color-onyx) 40%, transparent)",
        }}
      >
        <div ref={eyebrowRef} className="eyebrow text-accent">
          Основано 1994
        </div>
        <h1
          ref={headlineRef}
          className="mx-auto mt-4 max-w-[760px] text-balance text-(length:--fs-hero)! font-normal! leading-[1.1]! tracking-[-0.01em]! text-paper"
        >
          Добредојдовте во вашиот нов дом
        </h1>
        <p
          ref={leadRef}
          className="mx-auto mt-4 max-w-[520px] text-[length:var(--text-lead-size)] leading-[1.65] text-paper/90"
        >
          Секоја адреса има своја приказна. Откријте ја вашата.
        </p>
        <div
          ref={actionsRef}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
          style={{ textShadow: "none" }}
        >
          <Button href="/contact" variant="primary" tone="dark">
            Закажи консултација
          </Button>
          <Button href="/projects" variant="secondary" tone="dark">
            Проекти
          </Button>
        </div>
      </div>

      {/* The strip along the bottom: where we are on the left, who we are on the right, both on the container's edges. */}
      <div ref={statsBarRef} className="relative border-t border-paper/35">
        <div className="container-x flex flex-col items-center gap-2 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <span className="text-[12px] font-medium uppercase tracking-[0.24em] text-paper">
            Струмица, Северна Македонија
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.5em] text-accent">— Javor Sped Holding</span>
        </div>
      </div>
    </section>
  );
}
