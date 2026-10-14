"use client";

import { useEffect, useRef, useState } from "react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { useI18n } from "@/lib/i18n";
import { getLenis } from "@/lib/lenis";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * The opening of a project page, like the first frame of a film: the picture (or a short film) fills the screen, and
 * the project's name sits low and centred, small and quiet. One gradient lies over the media: dark at the top (the
 * navigation stays readable), clear in the middle, dark at the bottom (under the text). The film is muted, loops, and
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
  nextId = "za-proektot",
}: {
  name: string;
  /** "CITY · STATUS", already joined. */
  eyebrow: string;
  tagline?: string;
  image: { src: string; alt: string };
  video?: string;
  hasSound?: boolean;
  backHref?: string;
  /** The id of the section the "scroll" link goes to. */
  nextId?: string;
}) {
  const { t } = useI18n();
  const phone = useMediaQuery("(max-width: 767px)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
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

  const toggleSound = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const scrollNext = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(nextId);
    const top = target ? target.getBoundingClientRect().top + window.scrollY : window.innerHeight;
    const lenis = getLenis();
    if (lenis && !reduceMotion) lenis.scrollTo(top, { duration: 1.2 });
    else window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <section
      data-opening
      aria-label={name}
      className="scope-mist relative flex h-svh min-h-[560px] max-h-[1000px] w-full flex-col overflow-hidden bg-chrome text-paper"
    >
      {/* the picture (or the film) with the line about the project at its top left */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
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
              sizes="100vw"
              className="h-full w-full !bg-transparent"
            />
          </div>
        )}

        {/* the one gradient over the media: dark at the top (the navigation), clear below */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--color-onyx) 55%, transparent) 0%, transparent 32%, transparent 100%)",
          }}
        />

        <Link
          href={backHref}
          className="focus-ring absolute left-[5%] top-[calc(var(--nav-h)+8px)] z-10 inline-flex min-h-11 items-center text-[11px] font-semibold uppercase tracking-[0.2em] text-accent transition-colors hover:text-accent/80"
        >
          {t("opening.back")}
        </Link>

        {tagline && (
          <p
            style={{
              textShadow:
                "0 1px 3px color-mix(in srgb, var(--color-onyx) 60%, transparent), 0 4px 24px color-mix(in srgb, var(--color-onyx) 50%, transparent)",
            }}
            className="opening-rise absolute left-[5%] top-[calc(var(--nav-h)+56px)] m-0 max-w-[min(760px,90%)] text-[clamp(16px,1.7vw,26px)] leading-[1.45] text-paper"
          >
            {lead && <span className="font-light">{lead}</span>}
            <span className="font-display italic">{rest}</span>
          </p>
        )}
      </div>

      {/* under it, on Оникс: the name, where it is and its state, and on the right the sound and the way on */}
      <div className="opening-rise flex flex-wrap items-center justify-between gap-x-8 gap-y-3 bg-chrome px-[5%] py-5 md:py-6">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <h1 className="m-0 font-display text-[clamp(32px,3.6vw,56px)] font-normal leading-none text-paper">{name}</h1>
          <div className="eyebrow uppercase text-accent" style={{ letterSpacing: "0.3em" }}>
            {eyebrow}
          </div>
        </div>
        <div className="flex items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
          {showSound && (
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={!muted}
              aria-label={muted ? t("opening.soundOn") : t("opening.soundOff")}
              className="focus-ring inline-flex min-h-11 items-center gap-2 uppercase tracking-[0.3em]"
            >
              {t("opening.sound")} <span aria-hidden>{muted ? "×" : "♪"}</span>
            </button>
          )}
          <a
            href={`#${nextId}`}
            onClick={scrollNext}
            className="focus-ring inline-flex min-h-11 items-center uppercase tracking-[0.3em]"
          >
            {t("opening.scroll")}
          </a>
        </div>
      </div>
    </section>
  );
}
