"use client";

import "@/components/projects/projects.css";
import { useEffect, useRef, useState, useSyncExternalStore, type HTMLAttributes, type ReactNode } from "react";
import { Media } from "@/components/ui/Media";
import { NoPhoto } from "@/components/ui/NoPhoto";
import { PauseButton } from "@/components/ui/PauseButton";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { ImageFocus } from "@/types";

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

// A tap on the indicators or the pause button (touch) stops the slideshow for the rest of the visit (a phone has no
// hover to say "I am looking at this"): the flag lives in sessionStorage, one key per hero, so a tap on one hero does
// not stop another.
const stopListeners = new Set<() => void>();
const subscribeStop = (onChange: () => void) => {
  stopListeners.add(onChange);
  return () => void stopListeners.delete(onChange);
};
const readStop = (key: string) => {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};
const writeStop = (key: string, stopped: boolean) => {
  try {
    if (stopped) sessionStorage.setItem(key, "1");
    else sessionStorage.removeItem(key);
  } catch {
    // storage blocked: the stop then lasts until the page is closed, through the listeners
  }
  stopListeners.forEach((l) => l());
};

export interface HeroSlide {
  key: string;
  image: { src: string; alt: string; isPlaceholder: boolean };
  /** Where the photo is held when the frame trims it (x, y in %; zoom stays 1). */
  focus?: ImageFocus;
  /** The photo's own width in pixels (no wider variant is requested). */
  maxWidth?: number;
  /** The name of the slide for the indicator (read by screen readers). */
  label: string;
}

export interface HeroSlideshowControls {
  /** The index of the slide on screen. */
  slide: number;
  /** The indicators (null with a single slide). */
  tracks: ReactNode;
  /** The pause button (null with a single slide). */
  pause: ReactNode;
  /** Spread on the element around the controls: while the mouse is over it the slide stays. */
  rowProps: Pick<HTMLAttributes<HTMLDivElement>, "onPointerEnter" | "onPointerLeave">;
}

/**
 * A full-screen photo hero with a slideshow (the Проекти page, a project's opening): the photos cross-fade in the
 * `.photo-hero` frame (app/globals.css), a slide stays 5.5s, the indicator of the current slide fills in exactly that time
 * and its end moves on to the next slide. It never changes the slide under a click: it pauses while the tab is hidden,
 * while the hero is out of view, while the mouse is over the controls, while anything in the hero has keyboard focus, and
 * after the pause button; a tap on the indicators or the pause button (touch) stops it for the rest of the visit. With
 * reduced motion it does not advance by itself at all. The text and the layout of the controls are the page's own:
 * `children` gets the controls and returns the content that lies over the photos (or under them on a phone).
 */
export function HeroSlideshow({
  slides,
  storageKey,
  label,
  className,
  children,
}: {
  slides: HeroSlide[];
  /** The sessionStorage key of this hero's "stopped for the visit" flag. */
  storageKey: string;
  label: string;
  /** Added to the section's classes. */
  className?: string;
  children: (controls: HeroSlideshowControls) => ReactNode;
}) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const sectionRef = useRef<HTMLElement>(null);
  const [slide, setSlide] = useState(0);
  // a click on a slide button restarts the timer: bumping the key restarts the track's animation
  const [run, setRun] = useState(0);
  // the mouse is over the controls / something in the hero has keyboard focus / the hero is out of view: the slide stays
  const [hovered, setHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [manual, setManual] = useState(false);
  const stoppedForVisit = useSyncExternalStore(
    subscribeStop,
    () => readStop(storageKey),
    () => false
  );
  // what the last press was (mouse, touch, pen), to tell a tap from a click
  const pointer = useRef("mouse");
  const hidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false
  );
  const stopped = manual || stoppedForVisit || reduce;
  const paused = hovered || keyboardFocus || hidden || offscreen || stopped;
  const count = slides.length;
  const touched = () => {
    if (pointer.current !== "mouse") writeStop(storageKey, true);
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const tracks =
    count > 1 ? (
      <div className="pj-tracks">
        {slides.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className="pj-track-btn"
            aria-label={s.label}
            aria-current={i === slide ? "true" : undefined}
            onClick={() => {
              setSlide(i);
              setRun((r) => r + 1);
              touched();
            }}
          >
            <span className="pj-track">
              {i === slide &&
                (reduce ? (
                  <span className="pj-track-fill is-static" />
                ) : (
                  <span
                    key={`${slide}-${run}`}
                    className="pj-track-fill is-on"
                    style={{ animationPlayState: paused ? "paused" : "running" }}
                    onAnimationEnd={() => setSlide((n) => (n + 1) % count)}
                  />
                ))}
            </span>
          </button>
        ))}
      </div>
    ) : null;

  const pause =
    count > 1 ? (
      <PauseButton
        paused={stopped}
        onToggle={() => {
          if (reduce) return;
          if (stopped) {
            // play again, whatever stopped it
            setManual(false);
            writeStop(storageKey, false);
          } else if (pointer.current !== "mouse") writeStop(storageKey, true);
          else setManual(true);
        }}
        className="shrink-0"
      />
    ) : null;

  return (
    <section
      ref={sectionRef}
      className={className ? `pj-hero photo-hero photo-hero--fill ${className}` : "pj-hero photo-hero photo-hero--fill"}
      aria-label={label}
      onPointerDownCapture={(e) => (pointer.current = e.pointerType)}
      onFocus={(e) => e.target.matches(":focus-visible") && setKeyboardFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyboardFocus(false);
      }}
    >
      <div className="pj-media photo-hero__media">
        {slides.map((s, i) => (
          <div key={s.key} className={`pj-slide${i === slide ? " is-on" : ""}`} aria-hidden={i !== slide}>
            <div className="pj-slide-photo">
              {s.image.isPlaceholder || !s.image.src ? (
                // a project without a photo yet: the site's no-photo slide (Еспресо with the logo mark)
                <NoPhoto />
              ) : (
                <Media
                  image={s.image}
                  focus={s.focus}
                  maxWidth={s.maxWidth}
                  tone="dark"
                  alwaysCover
                  className="h-full w-full !bg-transparent"
                  // the frame is the first screen (or 16:9 on a phone): the photo covers it, as wide as the screen
                  sizes="100vw"
                  priority={i === 0}
                  defer={i !== 0}
                />
              )}
            </div>
          </div>
        ))}
        <div className="hero-scrim-top" aria-hidden />
        <div className="hero-scrim-bottom" aria-hidden />
      </div>

      {children({
        slide,
        tracks,
        pause,
        rowProps: {
          onPointerEnter: (e) => e.pointerType === "mouse" && setHovered(true),
          onPointerLeave: (e) => e.pointerType === "mouse" && setHovered(false),
        },
      })}
    </section>
  );
}
