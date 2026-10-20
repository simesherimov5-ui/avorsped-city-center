"use client";

import "./projects.css";
import { useRef, useState, useSyncExternalStore } from "react";
import { Media } from "@/components/ui/Media";
import { PauseButton } from "@/components/ui/PauseButton";
import { projectStatusLabel } from "@/lib/format";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { Project } from "@/types";

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

// A tap on the indicators, the pause button or the link stops the slideshow for the rest of the visit (a phone has no
// hover to say "I am looking at this"): the flag lives in sessionStorage.
const STOP_KEY = "pj-hero-stopped";
const stopListeners = new Set<() => void>();
const subscribeStop = (onChange: () => void) => {
  stopListeners.add(onChange);
  return () => void stopListeners.delete(onChange);
};
const readStop = () => {
  try {
    return sessionStorage.getItem(STOP_KEY) === "1";
  } catch {
    return false;
  }
};
const writeStop = (stopped: boolean) => {
  try {
    if (stopped) sessionStorage.setItem(STOP_KEY, "1");
    else sessionStorage.removeItem(STOP_KEY);
  } catch {
    // storage blocked: the stop then lasts until the page is closed, through the listeners
  }
  stopListeners.forEach((l) => l());
};

/**
 * The top of the projects page: a slideshow of the projects' photos on Оникс with the page's one heading. A slide stays
 * 5.5s; the track of the current slide fills in exactly that time and its end moves on to the next slide. It never
 * changes the slide under a click: it pauses while the tab is hidden, while the mouse is over the caption row, while
 * anything in the hero has keyboard focus, and after the pause button; a tap on the indicators, the pause button or the
 * link (touch) stops it for the rest of the visit. With reduced motion it does not advance by itself at all.
 */
export function ProjectsHero({ slides }: { slides: Project[] }) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [slide, setSlide] = useState(0);
  // a click on a slide button restarts the timer: bumping the key restarts the track's animation
  const [run, setRun] = useState(0);
  // the mouse is over the caption row / something in the hero has keyboard focus: the slide stays
  const [hovered, setHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [manual, setManual] = useState(false);
  const stoppedForVisit = useSyncExternalStore(subscribeStop, readStop, () => false);
  // what the last press was (mouse, touch, pen), to tell a tap from a click
  const pointer = useRef("mouse");
  const hidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false
  );
  const stopped = manual || stoppedForVisit || reduce;
  const paused = hovered || keyboardFocus || hidden || stopped;
  const count = slides.length;
  const touched = () => {
    if (pointer.current !== "mouse") writeStop(true);
  };

  const current = slides[slide];

  return (
    <section
      className="pj-hero"
      aria-label="Проекти"
      onPointerDownCapture={(e) => (pointer.current = e.pointerType)}
      onFocus={(e) => e.target.matches(":focus-visible") && setKeyboardFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyboardFocus(false);
      }}
    >
      <div className="pj-media">
        {slides.map((project, i) => (
          <div key={project.id} className={`pj-slide${i === slide ? " is-on" : ""}`} aria-hidden={i !== slide}>
            <div className="pj-slide-photo">
              <Media
                image={project.slideImage ?? project.heroImage}
                tone="dark"
                alwaysCover
                className="h-full w-full !bg-transparent"
                // the photo is 16:9 and so is the frame: shown whole, as wide as the screen
                sizes="100vw"
                priority={i === 0}
                defer={i !== 0}
              />
            </div>
          </div>
        ))}
        <div className="hero-scrim-bottom" aria-hidden />
      </div>

      <div className="pj-wrap pj-hero-inner">
        <div className="pj-hero-text">
          <h1 className="pj-h1">Разгледајте ги нашите проекти.</h1>
          <div className="pj-under">Можеби вашиот дом веќе ве чека.</div>
        </div>

        <div
          className="pj-hero-row"
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
        >
          <div className="pj-hero-left">
            {count > 1 && (
              <div className="pj-tracks">
                {slides.map((project, i) => (
                  <button
                    key={project.id}
                    type="button"
                    className="pj-track-btn"
                    aria-label={project.name}
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
                            onAnimationEnd={() => setSlide((s) => (s + 1) % count)}
                          />
                        ))}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {current && (
              <span className="pj-now" aria-live="off">
                <span className="pj-now-name">{current.name}</span>
                <span className="pj-now-meta">
                  {current.city} · {current.statusLabelOverride ?? projectStatusLabel(current.status)}
                </span>
              </span>
            )}
          </div>
          <PauseButton
            paused={stopped}
            onToggle={() => {
              if (reduce) return;
              if (stopped) {
                // play again, whatever stopped it
                setManual(false);
                writeStop(false);
              } else if (pointer.current !== "mouse") writeStop(true);
              else setManual(true);
            }}
            className="shrink-0"
          />
        </div>
      </div>
    </section>
  );
}
