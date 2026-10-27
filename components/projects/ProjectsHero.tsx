"use client";

import { HeroSlideshow } from "@/components/ui/HeroSlideshow";
import { projectStatusLabel } from "@/lib/format";
import type { Project } from "@/types";

/**
 * The top of the projects page: a slideshow of the projects' photos on Оникс with the page's one heading (the
 * slideshow itself, its timing and its pause rules are HeroSlideshow's). Its "stopped for the visit" flag is its own.
 */
export function ProjectsHero({ slides }: { slides: Project[] }) {
  const items = slides.map((project) => ({
    key: project.id,
    image: project.slideImage ?? project.heroImage,
    label: project.name,
  }));

  return (
    <HeroSlideshow slides={items} storageKey="pj-hero-stopped" label="Проекти">
      {({ slide, tracks, pause, rowProps }) => {
        const current = slides[slide];
        return (
          <div className="pj-wrap photo-hero__content">
            <div className="pj-hero-text">
              {/* cream-text (here and on the slide's name): gold over the brightest photos fell under 3:1 */}
              <h1 className="pj-h1 cream-text">Разгледајте ги нашите проекти.</h1>
              <div className="pj-under">Можеби вашиот дом веќе ве чека.</div>
            </div>

            <div className="pj-hero-row" {...rowProps}>
              <div className="pj-hero-left">
                {tracks}
                {current && (
                  <span className="pj-now cream-text" aria-live="off">
                    <span className="pj-now-name">{current.name}</span>
                    <span className="pj-now-meta">
                      {current.city} · {current.statusLabelOverride ?? projectStatusLabel(current.status)}
                    </span>
                  </span>
                )}
              </div>
              {pause}
            </div>
          </div>
        );
      }}
    </HeroSlideshow>
  );
}
