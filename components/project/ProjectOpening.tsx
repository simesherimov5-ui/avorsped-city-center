"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { PauseButton } from "@/components/ui/PauseButton";
import { useI18n } from "@/lib/i18n";
import { HERO_OVERLAY_QUERY } from "@/lib/hero";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { Project } from "@/types";

type Film = NonNullable<Project["heroFilm"]>;

/** The browser's "reduce data" setting (Data Saver, Save-Data). False on the server and where the browser has no such setting. */
function useSaveData() {
  return useSyncExternalStore(
    (onChange) => {
      const connection = (navigator as Navigator & { connection?: EventTarget }).connection;
      connection?.addEventListener("change", onChange);
      return () => connection?.removeEventListener("change", onChange);
    },
    () => Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData),
    () => false
  );
}

/**
 * Plays the film of the opening only while the hero is on screen and the tab is visible, and lets the visitor pause it.
 * `active` is whether the film is mounted at all. The visitor's pause is never overridden by the scroll and tab rules.
 */
function useFilmPlayback(videoRef: React.RefObject<HTMLVideoElement | null>, active: boolean) {
  const wantRef = useRef(true);
  const inViewRef = useRef(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!active || !el) return;
    // React leaves the `muted` attribute out of the server HTML: make sure the browser has it before it plays
    el.muted = true;
    const sync = () => {
      if (wantRef.current && inViewRef.current && !document.hidden) el.play().catch(() => {});
      else el.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;
      sync();
    });
    observer.observe(el);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [active, videoRef]);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    wantRef.current = el.paused;
    setPaused(!el.paused);
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  return { paused, toggle };
}

/**
 * The film of the opening: muted, looping, no sound track, in the 16:9 frame of the photo hero, nothing cropped. It is only
 * mounted where it may play (wide screen, no reduced motion, no Save-Data), so nothing of it is downloaded elsewhere. The
 * file is chosen once, when it mounts: 1080p for screens wider than 1280px, else 720p; it is never swapped while it plays.
 */
function OpeningFilm({ film, videoRef }: { film: Film; videoRef: React.RefObject<HTMLVideoElement | null> }) {
  const [src] = useState(() => (window.matchMedia("(min-width: 1281px)").matches ? film.hd : film.sd));
  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      src={src}
      muted
      autoPlay
      loop
      playsInline
      preload="metadata"
      aria-hidden
      tabIndex={-1}
    />
  );
}

/**
 * The opening of a project page: a photo hero (see app/globals.css, .photo-hero). The 16:9 picture, or the project's film,
 * fills the width under the solid header with nothing cropped; from the hero breakpoint (lib/hero.ts) the back link is
 * top left on it and, bottom left, the place and state, the name and the line about the project, the same width as the
 * Проекти hero; under it the picture is at the top and the text below on Оникс. The only darkening is the shared bottom
 * scrim; there are no text shadows. The label and the back link are Травертин, not gold, which does not read on a bright
 * sky. Without a film the picture is shown, and with one the picture is what shows until it plays.
 */
export function ProjectOpening({
  name,
  eyebrow,
  tagline,
  image,
  film,
  backHref = "/projects",
}: {
  name: string;
  /** "CITY · STATUS", already joined. */
  eyebrow: string;
  tagline?: string;
  image: { src: string; alt: string };
  film?: Film;
  backHref?: string;
}) {
  const { t } = useI18n();
  const overlay = useMediaQuery(HERO_OVERLAY_QUERY);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const saveData = useSaveData();
  const playFilm = Boolean(film) && overlay && !reduceMotion && !saveData;
  const videoRef = useRef<HTMLVideoElement>(null);
  const { paused, toggle } = useFilmPlayback(videoRef, playFilm);

  // "Шест згради, " in the sans, the rest in the serif; with no comma the whole line is serif.
  const comma = tagline ? tagline.indexOf(",") : -1;
  const lead = tagline && comma >= 0 ? tagline.slice(0, comma + 1) + " " : "";
  const rest = tagline ? (comma >= 0 ? tagline.slice(comma + 1).trim() : tagline) : "";

  return (
    <section aria-label={name} className="photo-hero">
      <div className="photo-hero__media">
        {/* the picture; the film lies over it once it plays */}
        <Media
          image={{ ...image, src: film?.poster ?? image.src, isPlaceholder: false }}
          tone="dark"
          priority
          alwaysCover
          sizes="100vw"
          className="h-full w-full !bg-transparent"
        />
        {playFilm && film && <OpeningFilm film={film} videoRef={videoRef} />}
        <div aria-hidden className="hero-scrim-bottom" />
      </div>

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
          {/* the bottom row: the text left, the film's pause button at the right end */}
          <div className="opening-rise flex items-end justify-between gap-8">
            <div className="min-w-0">
              <div className="eyebrow uppercase text-paper/85">{eyebrow}</div>
              <h1 className="m-0 mt-3 font-display text-[clamp(44px,6vw,96px)] font-normal leading-[1.05] text-balance text-paper">
                {name}
              </h1>
              {tagline && (
                <p className="m-0 mt-4 max-w-[min(760px,100%)] text-[clamp(16px,1.7vw,26px)] leading-[1.45] text-paper">
                  {lead && <span className="font-light">{lead}</span>}
                  <span className="font-display">{rest}</span>
                </p>
              )}
            </div>
            {playFilm && <PauseButton paused={paused} onToggle={toggle} className="shrink-0" />}
          </div>
        </div>
      </div>
    </section>
  );
}
