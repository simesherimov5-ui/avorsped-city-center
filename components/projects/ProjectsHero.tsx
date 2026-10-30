"use client";

import { HeroSlideshow } from "@/components/ui/HeroSlideshow";
import { projectStatusLabel } from "@/lib/format";
import { wideBoxFrames } from "@/lib/hero";
import { boxSizes } from "@/lib/image-sizes";
import type { Project } from "@/types";

/**
 * The top of the projects page: a slideshow of the projects' photos on Оникс with the page's one heading (the
 * slideshow itself, its timing and its pause rules are HeroSlideshow's). Its "stopped for the visit" flag is its own.
 * A photo that is also in its project's photo-led opening brings that slide's building box: on a wide screen the
 * building stays whole and under the header (.photo-hero--top .media-box__photo in app/globals.css).
 */
export function ProjectsHero({ slides }: { slides: Project[] }) {
  const items = slides.map((project) => {
    const image = project.slideImage ?? project.heroImage;
    const box =
      project.layout === "photo-led" ? project.openingSlides.find((s) => s.image.src === image.src)?.box : undefined;
    return {
      key: project.id,
      image,
      label: project.name,
      // the hero is the first screen from the top of the window (at least 560px), the header over it; the building
      // stays on the first screen
      ...(box && { box, sizes: boxSizes(image.src, box, wideBoxFrames("max(560px, 100svh)", "100svh")) }),
    };
  });

  return (
    <HeroSlideshow slides={items} storageKey="pj-hero-stopped" label="Проекти" className="photo-hero--top">
      {({ slide, tracks, pause, rowProps }) => {
        const current = slides[slide];
        return (
          <div className="pj-wrap photo-hero__content">
            <div className="pj-hero-text">
              <h1 className="pj-h1">Разгледајте ги нашите проекти.</h1>
              <div className="pj-under">Можеби вашиот дом веќе ве чека.</div>
            </div>

            <div className="pj-hero-row" {...rowProps}>
              <div className="pj-hero-left">
                {tracks}
                {current && (
                  <span className="pj-now" aria-live="off">
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
