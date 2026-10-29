"use client";

import { useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { PauseButton } from "@/components/ui/PauseButton";
import { useI18n } from "@/lib/i18n";
import { NAV_HEIGHTS, OPENING_WIDE_QUERY } from "@/lib/hero";
import { aspectOf } from "@/lib/image-sizes";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/cn";

type Slide = { image: { src: string; alt: string; isPlaceholder: boolean }; maxWidth?: number };

const SLIDE_MS = 7000;
const SWIPE_PX = 50;

// The wide opening's spacing (.pl-opening in app/globals.css reads the first two): the gap above and under the photo,
// which its side margins are never smaller than, and the space under the text. The photo's `sizes` is worked out from
// these, from the name's size and from the heights of the header, the back link and the label.
const GAP = "clamp(12px, 3svh, 32px)";
const PAD = "clamp(16px, 5svh, 56px)";
const TITLE = "clamp(56px, 8vw, 128px)";
const BACK_H = "44px";
/** The label's line: --label-size (12px) at the body's line height (1.7). */
const LABEL_H = "20.4px";

/**
 * The width the photo is shown at: on a wide screen as large as fits between the back link and the text (at most the
 * width less a gap on each side), else the full width. One entry per header height, so it is the frame's own width and
 * the browser never fetches a wider file than it shows.
 */
function photoSizes(aspect: number) {
  const wide = (nav: number) =>
    `min(100vw - 2 * ${GAP}, (100svh - ${nav}px - ${BACK_H} - 2 * ${GAP} - ${LABEL_H} - 16px - 0.95 * ${TITLE} - ${PAD}) * ${aspect.toFixed(4)})`;
  return [
    ...NAV_HEIGHTS.map(([min, nav]) => `${OPENING_WIDE_QUERY}${min ? ` and (min-width: ${min}px)` : ""} ${wide(nav)}`),
    "100vw",
  ].join(", ");
}

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

/**
 * The opening of a photo-led project page, on Оникс with the header clear over it, its photos always shown whole: no
 * crop, no scrim, nothing over them. On a wide screen (OPENING_WIDE_QUERY in lib/hero.ts) it is the whole first screen:
 * the back link under the header, the photo as large as fits, centred, then the label, the name, one dash per photo and
 * the pause button; narrower, the photo is full width right under the header, the back link and the text below it
 * (.pl-opening in app/globals.css). All the photos share one frame, the shape of the first. Every 7s the next photo
 * fades in over the one before (1.6s; the outgoing photo stays whole underneath until the new one is in, so no
 * background ever shows). The show waits while the mouse is over it, while something in it has keyboard focus and while
 * the tab is hidden; a dash, a swipe or an arrow key restarts the 7s; the pause button stops it. Reduced motion: the
 * first photo, no autoplay, no fade; the dashes still switch photos, at once.
 */
export function ProjectHeroSlideshow({
  name,
  eyebrow,
  slides,
  backHref = "/projects",
}: {
  name: string;
  /** "CITY · STATUS", already joined. */
  eyebrow: string;
  slides: Slide[];
  backHref?: string;
}) {
  const { t } = useI18n();
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [index, setIndex] = useState(0);
  // the photo being faded over: it stays fully shown underneath until the new one has come in
  const [previous, setPrevious] = useState<number | null>(null);
  // each move of the visitor restarts the 7s of the photo they chose
  const [restart, setRestart] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const tabHidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false
  );
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const count = slides.length;
  const paused = hovered || focused || tabHidden || stopped;
  const aspect = aspectOf(slides[0].image.src) ?? 16 / 9;
  const sizes = photoSizes(aspect);

  const show = (i: number) => {
    const next = (i + count) % count;
    if (next === index) return;
    setPrevious(reduce ? null : index);
    setIndex(next);
  };
  const goTo = (i: number) => {
    show(i);
    setRestart((n) => n + 1);
  };
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") swipeStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || count < 2) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(e.clientY - start.y)) goTo(index + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={name}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipeStart.current = null)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") goTo(index - 1);
        else if (e.key === "ArrowRight") goTo(index + 1);
      }}
      className="pl-opening relative isolate touch-pan-y overflow-hidden bg-onyx text-paper"
      style={{ "--pl-gap": GAP, "--pl-pad": PAD } as CSSProperties}
    >
      <div className="pl-opening__back mx-auto w-full max-w-[1320px] px-[5%]">
        <Link
          href={backHref}
          className="focus-ring inline-flex min-h-11 items-center text-label font-semibold uppercase tracking-label text-paper"
        >
          {t("opening.back")}
        </Link>
      </div>
      <div className="pl-opening__stage">
        {/* the photos stack among themselves only (isolate), in one frame of the photos' own shape */}
        <div
          className="pl-opening__frame isolate overflow-hidden"
          style={{ "--pl-aspect": aspect.toFixed(4) } as CSSProperties}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.image.src}
              aria-hidden={i !== index}
              className={cn(
                "absolute inset-0",
                // the incoming photo on top, fading in; the outgoing one whole under it; the rest hidden at once
                i === index
                  ? cn("z-[2] opacity-100", !reduce && "transition-opacity duration-[1600ms] ease-(--ease)")
                  : i === previous
                    ? "z-[1] opacity-100"
                    : "z-0 opacity-0"
              )}
              onTransitionEnd={(e) => {
                if (i === index && e.target === e.currentTarget) setPrevious(null);
              }}
            >
              <Media
                image={slide.image}
                tone="dark"
                alwaysCover
                maxWidth={slide.maxWidth}
                className="h-full w-full !bg-transparent"
                sizes={sizes}
                quality={85}
                priority={i === 0}
                defer={i !== 0}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="pl-opening__text mx-auto flex w-full max-w-[1320px] flex-wrap items-end justify-between gap-x-8 gap-y-6 px-[5%]">
        <div className="min-w-0">
          <div className="eyebrow photo-hero__eyebrow tracking-[0.4em]">{eyebrow}</div>
          <h1 className="m-0 mt-4 font-display font-normal leading-[0.95] text-paper" style={{ fontSize: TITLE }}>
            {name}
          </h1>
        </div>
        {count > 1 && (
          // 44px buttons: on a phone the gaps shrink so the dashes and the pause button fit 360px
          <div className="flex items-center gap-0.5 sm:gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.image.src}
                type="button"
                aria-label={`${i + 1} / ${count}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className="focus-ring flex h-11 w-11 items-center justify-center"
              >
                <span className="relative block h-[2px] w-8 overflow-hidden bg-paper/30">
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
            <PauseButton paused={stopped || reduce} onToggle={() => !reduce && setStopped((s) => !s)} />
          </div>
        )}
      </div>
    </section>
  );
}
