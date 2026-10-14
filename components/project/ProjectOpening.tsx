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
      className="relative h-svh min-h-[560px] max-h-[1000px] w-full overflow-hidden bg-ink text-paper"
    >
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

      {/* the one gradient over the media */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-onyx) 45%, transparent) 0%, transparent 22%, transparent 50%, color-mix(in srgb, var(--color-onyx) 85%, transparent) 100%)",
        }}
      />

      <Link
        href={backHref}
        className="focus-ring absolute left-[5%] top-[calc(var(--nav-h)+8px)] z-10 inline-flex min-h-11 items-center text-[11px] font-semibold uppercase tracking-[0.2em] text-on-chrome/70 transition-colors hover:text-on-chrome"
      >
        {t("opening.back")}
      </Link>

      <div className="opening-rise absolute inset-x-0 bottom-10 flex flex-col items-center gap-[18px] px-[5%] text-center md:bottom-16">
        <div className="eyebrow uppercase text-accent" style={{ letterSpacing: "0.5em" }}>
          {eyebrow}
        </div>
        <h1 className="font-display text-[clamp(44px,13vw,64px)] font-normal leading-none text-paper md:text-[clamp(56px,8vw,128px)]">
          {name}
        </h1>
        {tagline && (
          <p className="m-0 max-w-[900px]">
            {lead && <span className="text-base font-light text-on-chrome/80">{lead}</span>}
            <span className="font-display text-xl italic text-accent">{rest}</span>
          </p>
        )}
        <div className="mt-2.5 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-on-chrome/80">
          {showSound && (
            <>
              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={!muted}
                aria-label={muted ? t("opening.soundOn") : t("opening.soundOff")}
                className="focus-ring inline-flex items-center gap-3 uppercase tracking-[0.3em]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/50 text-sm">
                  {muted ? "×" : "♪"}
                </span>
                {t("opening.sound")}
              </button>
              <span aria-hidden className="h-7 w-px bg-paper/30" />
            </>
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
