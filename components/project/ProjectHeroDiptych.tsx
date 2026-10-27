"use client";

import { useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { PauseButton } from "@/components/ui/PauseButton";
import { useI18n } from "@/lib/i18n";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/cn";

type Photo = { src: string; alt: string; isPlaceholder: boolean };

const SLIDE_MS = 7000;
const SWIPE_PX = 50;

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

/**
 * The «diptych» opening of a photo-led project page: the whole first screen (100svh, at least 560px) with the header
 * clear over it. From 1024px two photos stand side by side, 50/50 with a 2px Оникс seam, and every 7s the next pair
 * cross-fades in (1.2s; the right photo 0.3s after the left); under 1024px one photo, the first of each pair. Over the
 * photos the site's scrims (.dip-scrim-top / -bottom in app/globals.css) under the header, the back link, the label, the
 * name, the pair dashes and the pause button; the label is the light gold of the photo heroes. The show waits while the mouse is over it, while
 * something in it has keyboard focus and while the tab is hidden; a dash, a swipe or a key restarts the 7s; the pause
 * button stops it. Reduced motion: the first pair (or photo), no cross-fade, no autoplay.
 */
export function ProjectHeroDiptych({
  name,
  eyebrow,
  pairs,
  backHref = "/projects",
}: {
  name: string;
  /** "CITY · STATUS", already joined. */
  eyebrow: string;
  /** The photo pairs, each the same light, two different views. */
  pairs: [Photo, Photo][];
  backHref?: string;
}) {
  const { t } = useI18n();
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [index, setIndex] = useState(0);
  // each move of the visitor restarts the 7s of the pair they chose
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
  const count = pairs.length;
  const paused = hovered || focused || tabHidden || stopped;

  const goTo = (i: number) => {
    setIndex((i + count) % count);
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

  const pane = (side: 0 | 1) =>
    pairs.map((pair, i) => (
      <div
        key={`${side}-${i}`}
        aria-hidden={i !== index}
        className={cn(
          "absolute inset-0 transition-opacity ease-in-out",
          reduce ? "duration-0" : "duration-[1200ms]",
          side === 1 && !reduce && "delay-300",
          i === index ? "opacity-100" : "opacity-0"
        )}
      >
        <Media
          image={pair[side]}
          tone="dark"
          alwaysCover
          className="h-full w-full !bg-transparent"
          // the left photo is the whole screen under 1024px; each is half of it from there
          sizes={side === 0 ? "(min-width: 1024px) 50vw, 100vw" : "50vw"}
          priority={i === 0}
          defer={i !== 0}
        />
      </div>
    ));

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
      {/* the panes, with the 2px Оникс seam between them (the section's own background) */}
      <div className="absolute inset-0 flex gap-[2px]">
        <div className="relative min-w-0 flex-1 overflow-hidden">{pane(0)}</div>
        <div className="relative hidden min-w-0 flex-1 overflow-hidden lg:block">{pane(1)}</div>
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
            <div className="flex items-center gap-2">
              {pairs.map((pair, i) => (
                <button
                  key={pair[0].src}
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
                          onAnimationEnd={() => setIndex((n) => (n + 1) % count)}
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
