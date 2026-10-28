"use client";

import { useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { PauseButton } from "@/components/ui/PauseButton";
import { useI18n } from "@/lib/i18n";
import { coverSizes } from "@/lib/image-sizes";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/cn";
import type { ImageFocus } from "@/types";

type Slide = { image: { src: string; alt: string; isPlaceholder: boolean }; focus?: ImageFocus; maxWidth?: number };

const SLIDE_MS = 7000;
const SWIPE_PX = 50;

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

/**
 * The opening of a photo-led project page: the whole first screen (100svh, at least 560px) with the header clear over
 * it, one photo at a time covering it (each held on its `focus` point, the centre by default), and every 7s the next
 * photo fades in over the one before (1.6s; the outgoing photo stays whole underneath until the new one is in, so no
 * background ever shows). Over the photos the site's scrims (.dip-scrim-top / -bottom in app/globals.css) under the
 * header, the back link, the label, the name, one dash per photo and the pause button; the label is the light gold of
 * the photo heroes. The show waits while the mouse is over it, while something in it has keyboard focus and while the
 * tab is hidden; a dash, a swipe or an arrow key restarts the 7s; the pause button stops it. Reduced motion: the first
 * photo, no autoplay, no fade; the dashes still switch photos, at once.
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
      className="relative isolate h-svh min-h-[560px] touch-pan-y overflow-hidden bg-onyx text-paper"
    >
      {/* the photos stack among themselves only (isolate), always under the scrims and the text */}
      <div className="absolute inset-0 isolate">
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
              focus={slide.focus}
              maxWidth={slide.maxWidth}
              className="h-full w-full !bg-transparent"
              sizes={coverSizes(slide.image.src, [{ w: "100vw", h: "max(100vh, 560px)" }])}
              quality={85}
              priority={i === 0}
              defer={i !== 0}
            />
          </div>
        ))}
      </div>
      <div aria-hidden className="dip-scrim-top" />
      <div aria-hidden className="dip-scrim-bottom" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="mx-auto w-full max-w-[1320px] px-[5%] pt-[calc(var(--nav-h)+16px)]">
          <Link
            href={backHref}
            className="focus-ring inline-flex min-h-11 items-center text-label font-semibold uppercase tracking-label text-paper"
          >
            {t("opening.back")}
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-[1320px] flex-wrap items-end justify-between gap-x-8 gap-y-6 px-[5%] pb-14">
          <div className="min-w-0">
            <div className="eyebrow photo-hero__eyebrow tracking-[0.4em]">{eyebrow}</div>
            <h1 className="m-0 mt-4 font-display text-[clamp(56px,8vw,128px)] font-normal leading-[0.95] text-paper">
              {name}
            </h1>
          </div>
          {count > 1 && (
            // 44px buttons: on a phone the gaps shrink so six dashes and the pause button fit 360px
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
      </div>
    </section>
  );
}
