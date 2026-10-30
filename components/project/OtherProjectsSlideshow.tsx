"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { NoPhoto } from "@/components/ui/NoPhoto";
import { PauseButton } from "@/components/ui/PauseButton";
import { CALM_EASE, gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { boxSizes } from "@/lib/image-sizes";
import { cn } from "@/lib/cn";
import { useSlideshow } from "@/lib/useSlideshow";
import type { ImageFocus, PhotoBox } from "@/types";

export interface OtherSlide {
  key: string;
  href: string;
  name: string;
  /** "CITY · STATUS", already joined. */
  eyebrow: string;
  tagline?: string;
  /** Null: the project has no photo yet and gets the site's no-photo card. */
  image: { src: string; alt: string; isPlaceholder: boolean } | null;
  /** The building box of the photo; the whole photo where the data has none. */
  box: PhotoBox;
  focus?: ImageFocus;
  maxWidth?: number;
}

const SLIDE_MS = 6000;

// The frame is 16:9 from 720px (the container is the screen less 64px of padding, 1280px at most) and 4:5 below.
const FRAMES = [
  { media: "(max-width: 719px)", w: "calc(100vw - 40px)", h: "calc((100vw - 40px) * 1.25)", top: "0px" },
  {
    media: "(min-width: 720px)",
    w: "min(100vw - 64px, 1280px)",
    h: "min((100vw - 64px) * 0.5625, 720px)",
    top: "0px",
  },
];

const arrowButton =
  "focus-ring flex h-11 w-11 items-center justify-center border text-lg leading-none transition-colors";

/**
 * «Другите наши проекти»: one project at a time in one frame (16:9, 4:5 on a phone), the photo whole on Оникс (never
 * cropped), the slide itself a link to the project. The timing, swipe, keys and pause rules are useSlideshow's, the same
 * as the Радовиш Twins opening's; this one also waits while it is out of view. With one project there are no controls.
 */
export function OtherProjectsSlideshow({ slides, light = false }: { slides: OtherSlide[]; light?: boolean }) {
  const {
    reduce,
    index,
    previous,
    clearPrevious,
    restart,
    stopped,
    toggleStop,
    paused,
    show,
    goTo,
    ref,
    sectionProps,
  } = useSlideshow({ count: slides.length, pauseOffscreen: true });
  const count = slides.length;
  const frame = useRef<HTMLDivElement>(null);

  // Once, as the frame comes into view: it opens with a clip from the bottom (1.1s), then the first slide's text fades in.
  useGSAP(
    () => {
      const el = frame.current;
      if (!el || prefersReducedMotion()) return;
      const text = el.querySelectorAll("[data-slide-text]");
      gsap.set(el, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(text, { autoAlpha: 0, y: 12 });
      const tl = gsap.timeline({ paused: true, defaults: { ease: CALM_EASE } });
      tl.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, clearProps: "clipPath" }).to(
        text,
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, clearProps: "opacity,visibility,transform" },
        0.9
      );
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => void tl.play(),
      });
      return () => trigger.kill();
    },
    { scope: frame }
  );
  const lineTone = light
    ? "border-ink/30 text-ink hover:border-gold-deep hover:text-gold-deep"
    : "border-on-chrome/40 text-on-chrome hover:border-gold hover:text-gold";

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
      <section
        ref={ref}
        aria-roledescription="carousel"
        aria-label="Другите наши проекти"
        tabIndex={count > 1 ? 0 : undefined}
        {...sectionProps}
        className="focus-ring touch-pan-y"
      >
        <div ref={frame} className="relative isolate aspect-[4/5] overflow-hidden bg-onyx min-[720px]:aspect-video">
          {slides.map((slide, i) => (
            <div
              key={slide.key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} од ${count}`}
              inert={i !== index}
              className={cn(
                "absolute inset-0 bg-onyx",
                // the incoming slide on top, fading in; the outgoing one whole under it; the rest hidden at once
                i === index
                  ? cn("z-[2] opacity-100", !reduce && "transition-opacity duration-1000 ease-(--ease)")
                  : i === previous
                    ? "z-[1] opacity-100"
                    : "z-0 opacity-0"
              )}
              onTransitionEnd={(e) => {
                if (i === index && e.target === e.currentTarget) clearPrevious();
              }}
            >
              {slide.image && !slide.image.isPlaceholder && slide.image.src ? (
                <Media
                  image={slide.image}
                  tone="dark"
                  box={slide.box}
                  focus={slide.focus}
                  maxWidth={slide.maxWidth}
                  className="h-full w-full !bg-onyx"
                  sizes={boxSizes(slide.image.src, slide.box, FRAMES)}
                  defer
                />
              ) : (
                <NoPhoto />
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-onyx/75 to-onyx/0"
              />
              <Link
                href={slide.href}
                className="focus-ring absolute inset-0 flex flex-col justify-end px-5 pb-6 text-on-chrome sm:px-8 sm:pb-9"
              >
                <span data-slide-text className="eyebrow uppercase text-gold">
                  {slide.eyebrow}
                </span>
                <span
                  data-slide-text
                  className="mt-2 block font-display text-(length:--fs-h3) font-normal leading-[1.2]"
                >
                  {slide.name}
                </span>
                {slide.tagline && (
                  <span data-slide-text className="mt-1 block truncate text-sm text-on-chrome/85">
                    {slide.tagline}
                  </span>
                )}
                <span data-slide-text className="mt-4 block text-label font-semibold uppercase tracking-label">
                  Разгледајте го проектот →
                </span>
              </Link>
            </div>
          ))}
        </div>

        {count > 1 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
            <div className="flex basis-full items-center sm:basis-auto sm:flex-1">
              {slides.map((slide, i) => (
                <button
                  key={slide.key}
                  type="button"
                  aria-label={`${slide.name}, ${i + 1} / ${count}`}
                  aria-current={i === index}
                  onClick={() => goTo(i)}
                  className="focus-ring flex h-11 min-w-0 flex-1 items-center justify-center sm:max-w-12"
                >
                  <span
                    className={cn(
                      "relative block h-[2px] w-full max-w-8 overflow-hidden",
                      light ? "bg-ink/20" : "bg-on-chrome/30"
                    )}
                  >
                    {i === index &&
                      (reduce ? (
                        <span className="absolute inset-0 bg-gold" />
                      ) : (
                        <span
                          key={`${index}-${restart}`}
                          className="slide-progress absolute inset-0 bg-gold"
                          style={{
                            animationDuration: `${SLIDE_MS}ms`,
                            animationPlayState: paused ? "paused" : "running",
                          }}
                          onAnimationEnd={() => show(index + 1)}
                        />
                      ))}
                  </span>
                </button>
              ))}
            </div>
            <div className={cn("font-display text-lg tabular-nums", light ? "text-ink" : "text-on-chrome")}>
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </div>
            <div className="flex items-center gap-2">
              <PauseButton paused={stopped || reduce} onToggle={toggleStop} />
              <button
                type="button"
                aria-label="Претходен проект"
                onClick={() => goTo(index - 1)}
                className={cn(arrowButton, lineTone)}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Следен проект"
                onClick={() => goTo(index + 1)}
                className={cn(arrowButton, lineTone)}
              >
                →
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
