"use client";

import type { CSSProperties } from "react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { HeroSlideshow, type HeroSlide } from "@/components/ui/HeroSlideshow";
import { useI18n } from "@/lib/i18n";

/**
 * The opening of a project page: the same photo slideshow hero as the Проекти page (HeroSlideshow, see app/globals.css,
 * .photo-hero--fill), with this project's photos. Above the hero breakpoint (lib/hero.ts) it is exactly the first screen, the
 * back link top left on the photos and, bottom left, the place and state, the name and the line about the project, the
 * indicators and the pause button at the right end of that row; under it the photos are at the top and the text below on
 * Оникс. The only darkening is the two shared scrims; there are no text shadows. The back link is Травертин; the label and the
 * start of the line (up to the first comma) are the site's gold. Its "stopped for the visit" flag is its own (`storageKey`).
 */
export function ProjectOpening({
  name,
  eyebrow,
  tagline,
  slides,
  storageKey,
  backHref = "/projects",
}: {
  name: string;
  /** "CITY · STATUS", already joined. */
  eyebrow: string;
  tagline?: string;
  slides: HeroSlide[];
  storageKey: string;
  backHref?: string;
}) {
  const { t } = useI18n();

  // "Шест згради, " in the sans (gold), the rest in the serif; with no comma the whole line is serif.
  const comma = tagline ? tagline.indexOf(",") : -1;
  const lead = tagline && comma >= 0 ? tagline.slice(0, comma + 1) + " " : "";
  const rest = tagline ? (comma >= 0 ? tagline.slice(comma + 1).trim() : tagline) : "";

  return (
    <HeroSlideshow slides={slides} storageKey={storageKey} label={name}>
      {({ tracks, pause, rowProps }) => (
        <div className="photo-hero__content">
          <div className="photo-hero__back">
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
              <Link
                href={backHref}
                className="focus-ring inline-flex min-h-11 items-center text-label font-semibold uppercase tracking-label text-paper/85 transition-colors hover:text-paper"
              >
                {t("opening.back")}
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
            {/* the bottom row: the text left, the controls at the right end (below the text where they do not fit beside it) */}
            <div className="opening-rise flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
              <div className="min-w-0 flex-1 basis-[420px]">
                <div className="eyebrow uppercase text-gold [text-shadow:0_1px_14px_rgba(0,0,0,0.45)]">{eyebrow}</div>
                <h1 className="m-0 mt-3 font-display text-[clamp(44px,6vw,96px)] font-normal leading-[1.05] text-balance text-paper">
                  {name}
                </h1>
                {tagline && (
                  <p className="m-0 mt-4 max-w-[min(760px,100%)] text-[clamp(16px,1.7vw,26px)] leading-[1.45] text-paper">
                    {lead && (
                      <span className="font-normal text-gold [text-shadow:0_1px_14px_rgba(0,0,0,0.45)]">{lead}</span>
                    )}
                    <span className="font-display">{rest}</span>
                  </p>
                )}
              </div>
              {tracks && (
                <div
                  className="flex shrink-0 items-center gap-3"
                  style={{ "--pj-track-w": "44px" } as CSSProperties}
                  {...rowProps}
                >
                  {tracks}
                  {pause}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </HeroSlideshow>
  );
}
