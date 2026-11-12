"use client";

import { HeroSlideshow } from "@/components/ui/HeroSlideshow";
import { projectStatusLabel } from "@/lib/format";
import { IMAGE_DIMS } from "@/lib/image-dims";
import { WIDE_PHOTO } from "@/components/ui/Media";
import { aspectOf, wholeSizes } from "@/lib/image-sizes";
import type { ImageFocus, Project } from "@/types";

// Where each slide's wide photo is held from 1024px, where it covers the whole first screen and some sky, foreground or a
// sliver of the sides gives way (x, y in %: 0 keeps the top / left edge, 50 centres, 100 keeps the bottom / right edge).
// Chosen from where the buildings stand in each 1672×941 picture, so roofs and bases stay on screen, below the heading
// where the screen allows. City Center: roofs at 34% of the height, base at 62%, the buildings from 4% to 96% of the width
// (centred, so a wide screen trims sky and road evenly); Радовиш Twins: roof at 21%, base at 70% (all the trim from the lawn,
// as there is little sky above the roof); Дојрански Рај, from the air: the building between 28% and 77% (a little more
// trimmed from the trees at the bottom than from the top). A slide without an entry is centred. zoom stays 1: never enlarged.
const SLIDE_FRAMING: Record<string, ImageFocus> = {
  "city-center": { zoom: 1, x: 50, y: 50 },
  "dojranski-raj": { zoom: 1, x: 50, y: 40 },
  "radovish-twins": { zoom: 1, x: 50, y: 0 },
};

/**
 * The top of the projects page: a slideshow of the projects' photos on Оникс with the page's one heading (the
 * slideshow itself, its timing and its pause rules are HeroSlideshow's). Each photo keeps its own proportions (Media's
 * `whole`): from 1024px a wide one covers the hero from edge to edge, framed per slide (SLIDE_FRAMING) so its buildings stay
 * whole, and a narrow one is shown whole on Оникс; on a phone every photo is whole at the full width. From 1024px exactly the first screen with the heading over the photo and the
 * indicators, the project's name and its town and status in one group at the bottom left; narrower, the heading above the
 * photo and the group below it, on Оникс.
 */
export function ProjectsHero({ slides }: { slides: Project[] }) {
  const items = slides.map((project) => {
    const image = project.slideImage ?? project.heroImage;
    const width = IMAGE_DIMS[image.src]?.[0];
    const aspect = aspectOf(image.src) ?? 16 / 9;
    return {
      key: project.id,
      image,
      label: project.name,
      focus: SLIDE_FRAMING[project.id],
      ...(width && {
        maxWidth: width,
        // from 1024px a wide photo covers the first screen, a narrow one fits inside it; the full width narrower
        sizes:
          aspect >= WIDE_PHOTO
            ? `(min-width: 1024px) max(100vw, 100svh * ${aspect.toFixed(4)}), 100vw`
            : wholeSizes(image.src, width, [{ media: "(min-width: 1024px)", w: "100vw", h: "100svh" }, { w: "100vw" }]),
      }),
    };
  });

  return (
    <HeroSlideshow slides={items} storageKey="pj-hero-stopped" label="Проекти" className="photo-hero--top" wholePhotos>
      {({ slide, tracks, pause, rowProps }) => {
        const current = slides[slide];
        return (
          <div className="pj-wrap photo-hero__content">
            <div className="pj-hero-text">
              <h1 className="pj-h1">Разгледајте ги нашите проекти.</h1>
              <div className="pj-under photo-hero__eyebrow">Можеби вашиот дом веќе ве чека.</div>
            </div>

            <div className="pj-hero-row" {...rowProps}>
              <div className="pj-hero-left">
                <div className="pj-controls">
                  {tracks}
                  {pause}
                </div>
                {current && (
                  <span className="pj-now" aria-live="off">
                    <span className="pj-now-name">{current.name}</span>
                    <span className="pj-now-meta">
                      {current.city} · {current.statusLabelOverride ?? projectStatusLabel(current.status)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }}
    </HeroSlideshow>
  );
}
