"use client";

import { useEffect, useRef, useState } from "react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { coverSizes } from "@/lib/image-sizes";
import { PauseButton } from "@/components/ui/PauseButton";
import { useI18n } from "@/lib/i18n";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * The opening of a project page, like the first frame of a film: the picture (or a short film) fills the whole first
 * screen and the text sits on it, in the site's container: the back link top left, and bottom left the place and state,
 * the project's name and the line about it. Two local scrims (.hero-scrim-top, .hero-scrim-bottom) keep the text readable
 * and leave the middle of the picture in its own colours; there are no text shadows. The back link and the label are Травертин
 * (85%), not gold: gold does not read on a bright sky. The film is muted, loops, and
 * is left out on phones and with reduced motion, where the picture is shown instead. The sound button only appears
 * when a film with sound is playing, and always starts muted. With no film the picture settles slowly (still with
 * reduced motion).
 */
export function ProjectOpening({
  name,
  eyebrow,
  tagline,
  image,
  video,
  hasSound = true,
  backHref = "/projects",
}: {
  name: string;
  /** "CITY · STATUS", already joined. */
  eyebrow: string;
  tagline?: string;
  image: { src: string; alt: string };
  video?: string;
  hasSound?: boolean;
  backHref?: string;
}) {
  const { t } = useI18n();
  const phone = useMediaQuery("(max-width: 767px)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [filmPaused, setFilmPaused] = useState(false);
  const showVideo = Boolean(video) && !phone && !reduceMotion;
  const showSound = showVideo && hasSound && playing;

  // React leaves the `muted` attribute out of the server HTML, so the browser may have refused to autoplay: start it
  // once the film is muted for sure.
  useEffect(() => {
    const el = videoRef.current;
    if (!showVideo || !el) return;
    el.muted = true;
    el.play().catch(() => {});
  }, [showVideo]);

  // "Шест згради, " in the sans, the rest in the serif italic; with no comma the whole line is serif italic.
  const comma = tagline ? tagline.indexOf(",") : -1;
  const lead = tagline && comma >= 0 ? tagline.slice(0, comma + 1) + " " : "";
  const rest = tagline ? (comma >= 0 ? tagline.slice(comma + 1).trim() : tagline) : "";

  const toggleFilm = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
      setFilmPaused(false);
    } else {
      el.pause();
      setFilmPaused(true);
    }
  };

  const toggleSound = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  return (
    <section
      data-opening
      aria-label={name}
      className="relative h-[max(100svh,560px)] w-full overflow-hidden bg-chrome text-paper"
    >
      {/* the picture (or the film), edge to edge */}
      {showVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={video}
          poster={image.src}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      ) : (
        <div className={`absolute inset-0 ${video ? "" : "opening-settle"}`}>
          <Media
            image={{ ...image, isPlaceholder: false }}
            tone="dark"
            priority
            sizes={coverSizes(image.src, [{ w: "100vw", h: "max(100svh, 560px)" }])}
            className="h-full w-full !bg-transparent"
          />
        </div>
      )}

      {/* the only darkening: under the navigation and the back link, and under the text at the bottom (app/globals.css) */}
      <div aria-hidden className="hero-scrim-top" />
      <div aria-hidden className="hero-scrim-bottom" />

      <div className="absolute inset-0 flex flex-col justify-between">
        <div className="mx-auto w-full max-w-7xl px-5 pt-[calc(var(--nav-h)+8px)] sm:px-8 lg:px-10">
          <Link
            href={backHref}
            className="focus-ring inline-flex min-h-11 items-center text-label font-semibold uppercase tracking-label text-paper/85 transition-colors hover:text-paper"
          >
            {t("opening.back")}
          </Link>
        </div>

        {/* bottom left: where it is and its state, the name, the line about the project; bottom right the film's controls */}
        <div className="mx-auto w-full max-w-7xl px-5 pb-8 sm:px-8 md:pb-14 lg:px-10">
          <div className="opening-rise flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
            <div className="min-w-0">
              <div className="eyebrow uppercase text-paper/85">{eyebrow}</div>
              <h1 className="m-0 mt-3 font-display text-[clamp(44px,6vw,96px)] font-normal leading-[1.05] text-balance text-paper">
                {name}
              </h1>
              {tagline && (
                <p className="m-0 mt-4 max-w-[min(760px,100%)] text-[clamp(16px,1.7vw,26px)] leading-[1.45] text-paper">
                  {lead && <span className="font-light">{lead}</span>}
                  <span className="font-display italic">{rest}</span>
                </p>
              )}
            </div>
            {showVideo && (
              <div className="flex items-center gap-8 text-label font-semibold uppercase tracking-label text-accent">
                <PauseButton paused={filmPaused} onToggle={toggleFilm} />
                {showSound && (
                  <button
                    type="button"
                    onClick={toggleSound}
                    aria-pressed={!muted}
                    aria-label={muted ? t("opening.soundOn") : t("opening.soundOff")}
                    className="focus-ring inline-flex min-h-11 items-center gap-2 uppercase tracking-label"
                  >
                    {t("opening.sound")} <span aria-hidden>{muted ? "×" : "♪"}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
