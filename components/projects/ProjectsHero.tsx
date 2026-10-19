"use client";

import "./projects.css";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Media } from "@/components/ui/Media";
import { SheenOnce } from "@/components/ui/SheenOnce";
import { PauseButton } from "@/components/ui/PauseButton";
import { projectStatusLabel } from "@/lib/format";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { Project } from "@/types";

const SLIDE_MS = 5500;

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

/**
 * The top of the projects page: a slideshow of the projects' photos on Оникс with the page's one heading. A slide stays
 * 5.5s; the track of the current slide fills in exactly that time and its end moves on to the next slide. It pauses
 * while the tab is hidden and while a slide button has keyboard focus. With reduced motion the tracks are full and a
 * timer changes the slides (the photos still cross-fade).
 */
export function ProjectsHero({ slides }: { slides: Project[] }) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [slide, setSlide] = useState(0);
  // a click on a slide button restarts the timer: bumping the key restarts the track's animation
  const [run, setRun] = useState(0);
  const [focused, setFocused] = useState(false);
  const [manual, setManual] = useState(false);
  const hidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false
  );
  const paused = focused || hidden || manual;
  const count = slides.length;

  // With reduced motion there is no animation to end a slide, so a timer does it.
  useEffect(() => {
    if (!reduce || paused || count < 2) return;
    const id = window.setTimeout(() => setSlide((s) => (s + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [reduce, paused, count, slide, run]);

  const current = slides[slide];

  return (
    <section className="pj-hero" aria-label="Проекти">
      <PauseButton
        paused={manual}
        onToggle={() => setManual((m) => !m)}
        className="absolute right-[5%] top-[calc(var(--nav-h)+16px)] z-10"
      />
      {slides.map((project, i) => (
        <div key={project.id} className={`pj-slide${i === slide ? " is-on" : ""}`} aria-hidden={i !== slide}>
          <div className="pj-slide-photo">
            <Media
              image={project.heroImage}
              tone="dark"
              fit={project.imageFit ?? "cover"}
              focus={project.imageFocus}
              className="h-full w-full !bg-transparent"
              // the frame is tall and the photo is drawn at the height of it times its aspect, so wider than the screen on a phone or a tablet
              sizes="(max-width: 767px) 330vw, (max-width: 900px) 170vw, (max-width: 1280px) 130vw, 100vw"
              priority={i === 0}
              defer={i !== 0}
            />
          </div>
        </div>
      ))}
      <div className="pj-hero-scrim-x" />
      <div className="pj-hero-scrim-y" />

      <div className="pj-wrap pj-hero-inner">
        <div className="pj-hero-text">
          <SheenOnce className="pj-sheen">JAVOR SPED · ПРОЕКТИ</SheenOnce>
          <h1 className="pj-h1">Разгледајте ги нашите проекти.</h1>
          <div className="pj-under">Можеби вашиот дом веќе ве чека.</div>
        </div>

        <div className="pj-hero-row">
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
                    }}
                    onFocus={(e) => setFocused(e.currentTarget.matches(":focus-visible"))}
                    onBlur={() => setFocused(false)}
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
          <span className="pj-scroll" aria-hidden>
            СКРОЛАЈ
            <span className="pj-cue-line">
              <span className="pj-cue" />
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
