"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { BuildingMark } from "@/components/ui/Logo";
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
  /** Null: the project has no photo yet and gets the no-photo slide. */
  image: { src: string; alt: string; isPlaceholder: boolean } | null;
  /** The building box of the photo; the whole photo where the data has none. */
  box: PhotoBox;
  focus?: ImageFocus;
  maxWidth?: number;
}

const SLIDE_MS = 6000;

// The frame is as wide as the window: 4:5 below 720px, from 720px clamp(420px, 70svh, 760px) high. (`sizes` only needs the
// width as a hint, so 100vw is fine here: the frame itself is a plain block, never wider than the page.)
const FRAMES = [
  { media: "(max-width: 719px)", w: "100vw", h: "calc(100vw * 1.25)", top: "0px" },
  { media: "(min-width: 720px)", w: "100vw", h: "clamp(420px, 70svh, 760px)", top: "0px" },
];

// The page's container: the head row, the text on the slides and the controls all start at the same left edge.
const CONTAINER = "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10";

/** A project without a photo yet: Оникс, a thin gold line inside the frame and the logo mark at 18% (as the no-photo card on Проекти). */
function NoPhotoSlide() {
  return (
    <div aria-hidden className="absolute inset-0 flex items-center justify-center bg-onyx">
      {/* the thin line runs just outside the text column, so it follows the container, not the screen edge */}
      <div className={cn(CONTAINER, "absolute inset-0 py-4 sm:py-6")}>
        <div className="-mx-3 h-full border border-gold/30 sm:-mx-4" />
      </div>
      <BuildingMark className="text-on-chrome" style={{ height: 96, width: "auto", opacity: 0.18 }} />
    </div>
  );
}

const arrowButton =
  "focus-ring flex h-11 w-11 items-center justify-center border text-lg leading-none transition-colors";

/**
 * «Другите наши проекти»: one project at a time in one frame (the window's full width, 4:5 on a phone, clamp(420px, 70svh, 760px) high from 720px), the photo whole on Оникс (never
 * cropped; a project without one gets the no-photo slide), the slide itself a link to the project. The timing, swipe, keys and pause rules are useSlideshow's, the same
 * as the Радовиш Twins opening's; this one also waits while it is out of view. With one project there are no controls.
 */
export function OtherProjectsSlideshow({ slides }: { slides: OtherSlide[] }) {
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
      // the heading layer, then the text of the first slide
      const text = [
        ...el.querySelectorAll("[data-head]"),
        ...(el.querySelector("[role=group]")?.querySelectorAll("[data-slide-text]") ?? []),
      ];
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
  const lineTone = "border-on-chrome/40 text-on-chrome hover:border-gold hover:text-gold";
  // «Сите проекти →»: top right of the frame from 720px, under the controls on a phone (never both on screen)
  const allProjects = (className: string) => (
    <Link href="/projects" data-head className={cn("btn-tertiary focus-ring", className)}>
      Сите проекти →
    </Link>
  );

  return (
    <>
      <section
        ref={ref}
        aria-roledescription="carousel"
        aria-label="Другите наши проекти"
        {...sectionProps}
        className="focus-ring touch-pan-y"
      >
        <div
          ref={frame}
          className="relative isolate aspect-[4/5] overflow-hidden bg-onyx min-[720px]:aspect-auto min-[720px]:h-[clamp(420px,70svh,760px)]"
        >
          {/* The heading layer: fixed, above every slide, outside the slide links. Its DOM place first makes «Сите проекти →»
              the first stop of the tab order. A soft top shadow lies under it for the text. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[42%] bg-gradient-to-b from-onyx/90 via-onyx/78 via-55% to-onyx/0"
          />
          <div className="absolute inset-x-0 top-[22px] z-[4] min-[720px]:top-[34px]">
            <div className={CONTAINER}>
              <div data-head className="eyebrow text-gold">
                JAVOR SPED HOLDING
              </div>
              <div className="mt-3 flex items-center justify-between gap-6">
                <h2
                  data-head
                  className="m-0 font-display text-(length:--fs-h2) font-normal leading-[1.1] text-on-chrome"
                >
                  Другите наши проекти
                </h2>
                <div className="hidden shrink-0 min-[720px]:block">{allProjects("")}</div>
              </div>
            </div>
          </div>
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
              {slide.image ? (
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
                <NoPhotoSlide />
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-onyx/92 via-onyx/80 via-45% to-onyx/0"
              />
              <Link href={slide.href} className="focus-ring absolute inset-0 flex items-end text-on-chrome">
                <span className={cn(CONTAINER, "block pb-6 sm:pb-9")}>
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
                </span>
              </Link>
            </div>
          ))}
        </div>

        {count > 1 && (
          <div className={cn(CONTAINER, "mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-1")}>
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
                  <span className="relative block h-[2px] w-full max-w-8 overflow-hidden bg-on-chrome/30">
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
            <div className="font-display text-lg tabular-nums text-on-chrome">
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
        <div className={cn(CONTAINER, "min-[720px]:hidden", count > 1 ? "mt-1" : "mt-4")}>{allProjects("")}</div>
      </section>
    </>
  );
}
