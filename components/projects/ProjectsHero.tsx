"use client";

import "./projects.css";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Media } from "@/components/ui/Media";
import type { Project } from "@/types";

const SLIDE_MS = 5500;

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

/**
 * The top of the projects page: a slideshow of the projects' photos on Оникс with the page's one heading. A slide stays
 * 5.5s and the photos cross-fade; it pauses while the tab is hidden.
 */
export function ProjectsHero({ slides }: { slides: Project[] }) {
  const [slide, setSlide] = useState(0);
  const hidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false
  );
  const paused = hidden;
  const count = slides.length;

  // A timer changes the slides (the photos cross-fade); it pauses while the tab is hidden.
  useEffect(() => {
    if (paused || count < 2) return;
    const id = window.setTimeout(() => setSlide((s) => (s + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [paused, count, slide]);

  return (
    <section className="pj-hero" aria-label="Проекти">
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
          <div className="pj-sheen">JAVOR SPED · ПРОЕКТИ</div>
          <h1 className="pj-h1">Разгледајте ги нашите проекти.</h1>
          <div className="pj-under">Можеби вашиот дом веќе ве чека.</div>
        </div>
      </div>
    </section>
  );
}
