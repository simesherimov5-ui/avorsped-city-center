"use client";

import "./opening-intro.css";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type RefObject,
} from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { INTRO_TITLE_LEAD_S, introSkipped, markIntroPlayed } from "@/lib/opening-intro";

export interface IntroFilm {
  hd: string;
  sd: string;
  poster: string;
}

/** film → title (the line builds, word by word) → slam (the name) → leave (the layers fade, the page comes in) → page */
export type IntroPhase = "unknown" | "film" | "title" | "slam" | "leave" | "page";

// The timeline of the title, in seconds (the words and the slam are CSS animations keyed on the phase, see opening-intro.css).
const WORD_START = 0.2;
const WORD_STEP = 0.19;
const WORD_SETTLE = 1;
const HOLD = 0.8;
const SLAM_TO_PAGE = 2.4;
const LEAVE = 1;

const setPhaseAttr = (phase: Exclude<IntroPhase, "unknown">) => {
  const root = document.documentElement;
  if (phase === "page") root.removeAttribute("data-cc-intro");
  else root.setAttribute("data-cc-intro", phase);
};

/**
 * Whether this visit plays the intro. "unknown" on the server and while hydrating (the layers are drawn covered, and the
 * page's boot script has already hidden them if the intro will not play); decided once, on the client, per component.
 */
function useIntroDecision(enabled: boolean): "unknown" | "play" | "skip" {
  const [store] = useState(() => {
    let value: "unknown" | "play" | "skip" = "unknown";
    const listeners = new Set<() => void>();
    return {
      get: () => value,
      subscribe: (onChange: () => void) => {
        listeners.add(onChange);
        if (value === "unknown") {
          value = enabled && !introSkipped() ? "play" : "skip";
          onChange();
        }
        return () => void listeners.delete(onChange);
      },
    };
  });
  return useSyncExternalStore(store.subscribe, store.get, () => "unknown" as const);
}

/**
 * The state machine of the intro. It never locks scrolling: a wheel, touch move, scroll, tap on the film or a key (not Tab
 * or a modifier) during the film starts the title at once, and so does «Прескокни». The title starts when the film's
 * currentTime is 3.2s from its end (the film reports that, see IntroVideo), and everything after it is on timers.
 */
export function useOpeningIntro(film: IntroFilm | undefined, wordCount: number) {
  const decision = useIntroDecision(Boolean(film));
  const [phase, setPhase] = useState<Exclude<IntroPhase, "unknown">>("film");
  const phaseRef = useRef<Exclude<IntroPhase, "unknown">>("film");
  const timers = useRef<number[]>([]);

  const go = useCallback((next: Exclude<IntroPhase, "unknown">) => {
    phaseRef.current = next;
    setPhase(next);
    setPhaseAttr(next);
  }, []);

  const startTitle = useCallback(() => {
    if (phaseRef.current !== "film") return;
    go("title");
    const slamAt = (WORD_START + WORD_STEP * Math.max(0, wordCount - 1) + WORD_SETTLE + HOLD) * 1000;
    timers.current.push(
      window.setTimeout(() => go("slam"), slamAt),
      window.setTimeout(() => go("leave"), slamAt + SLAM_TO_PAGE * 1000),
      window.setTimeout(
        () => {
          go("page");
          // keyboard focus starts at the top of the page, only if it was in the intro (or nowhere): never the scroll position
          const active = document.activeElement;
          if (!active || active === document.body || active.closest(".cc-intro, .cc-skip")) {
            document.body.tabIndex = -1;
            document.body.focus({ preventScroll: true });
            document.body.removeAttribute("tabindex");
          }
        },
        slamAt + (SLAM_TO_PAGE + LEAVE) * 1000
      )
    );
  }, [go, wordCount]);

  useEffect(() => {
    if (decision !== "play") return;
    markIntroPlayed();
    // the intro starts at the top of the page
    window.scrollTo(0, 0);
    document.documentElement.setAttribute("data-cc-intro", "film");
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (["Tab", "Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) return;
      startTitle();
    };
    const opts = { passive: true } as const;
    window.addEventListener("wheel", startTitle, opts);
    window.addEventListener("touchmove", startTitle, opts);
    window.addEventListener("scroll", startTitle, opts);
    window.addEventListener("keydown", onKey);
    const pending = timers.current;
    return () => {
      window.removeEventListener("wheel", startTitle);
      window.removeEventListener("touchmove", startTitle);
      window.removeEventListener("scroll", startTitle);
      window.removeEventListener("keydown", onKey);
      pending.forEach((t) => window.clearTimeout(t));
      pending.length = 0;
      document.documentElement.removeAttribute("data-cc-intro");
    };
  }, [decision, startTitle]);

  const effective: IntroPhase = decision === "skip" ? "page" : decision === "unknown" ? "unknown" : phase;
  return { phase: effective, startTitle };
}

/**
 * The film, muted and inline, once. The file is chosen when it mounts (1080p above 1280px, else 720p) and never swapped.
 * It reports the title's moment from its own currentTime; if play() is refused (iOS Low Power Mode), it fails or it stops
 * moving for 2s, the title starts at once.
 */
function IntroVideo({
  film,
  onTitle,
  progress,
}: {
  film: IntroFilm;
  onTitle: () => void;
  progress: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src] = useState(() => (window.matchMedia("(min-width: 1281px)").matches ? film.hd : film.sd));
  const [playing, setPlaying] = useState(false);
  const titleRef = useRef(onTitle);
  useEffect(() => {
    titleRef.current = onTitle;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    const title = () => titleRef.current();
    el.play().catch(title);
    const onTime = () => {
      if (el.duration && el.currentTime >= el.duration - INTRO_TITLE_LEAD_S) title();
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("error", title);
    el.addEventListener("ended", title);
    let last = -1;
    let lastMove = performance.now();
    const watchdog = window.setInterval(() => {
      if (el.currentTime !== last) {
        last = el.currentTime;
        lastMove = performance.now();
      } else if (performance.now() - lastMove > 2000) title();
    }, 500);
    let raf = 0;
    const tick = () => {
      const bar = progress.current;
      if (bar && el.duration) bar.style.transform = `scaleX(${Math.min(1, el.currentTime / el.duration)})`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("error", title);
      el.removeEventListener("ended", title);
      window.clearInterval(watchdog);
      cancelAnimationFrame(raf);
    };
  }, [progress]);

  return (
    <video
      ref={ref}
      className={cn("cc-video", playing && "is-playing")}
      src={src}
      poster={film.poster}
      muted
      autoPlay
      loop={false}
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
    />
  );
}

/**
 * Copies of the page's heading and line, drawn over the film in the exact place, size and colours of the real ones (they
 * are measured and kept in step on resize, rotation and scroll), so that the text builds where it will stay and nothing
 * moves when the page appears: the real ones lie under the layers and show through as they fade.
 */
function IntroCopy({
  name,
  tagline,
  h1Ref,
  pRef,
  h1Class,
  pClass,
}: {
  name: string;
  tagline: string;
  h1Ref: RefObject<HTMLElement | null>;
  pRef: RefObject<HTMLElement | null>;
  h1Class: string;
  pClass: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = wrap.current;
    const h1 = h1Ref.current;
    const p = pRef.current;
    if (!root || !h1 || !p) return;
    const h1Copy = root.querySelector<HTMLElement>(".cc-copy-h1");
    const pCopy = root.querySelector<HTMLElement>(".cc-copy-p");
    let raf = 0;
    const put = (copy: HTMLElement | null, real: HTMLElement) => {
      if (!copy) return;
      const r = real.getBoundingClientRect();
      copy.style.setProperty("--x", `${r.left}px`);
      copy.style.setProperty("--y", `${r.top}px`);
      copy.style.setProperty("--w", `${r.width}px`);
    };
    const place = () => {
      raf = 0;
      put(h1Copy, h1);
      put(pCopy, p);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };
    place();
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(h1);
    observer.observe(p);
    document.fonts?.ready.then(schedule);
    return () => {
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      window.removeEventListener("scroll", schedule);
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [h1Ref, pRef]);

  const words = tagline.split(" ");
  return (
    <div ref={wrap} className="cc-copy">
      <div className={cn("cc-copy-h1", h1Class)}>{name}</div>
      <div className={cn("cc-copy-p", pClass)}>
        {words.map((word, i) => (
          <span key={i}>
            <span className="cc-word" style={{ "--i": i } as CSSProperties}>
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </div>
    </div>
  );
}

/** The layers of the intro and «Прескокни»: before the slideshow in the page, so «Прескокни» is the first thing a keyboard reaches. */
export function OpeningIntroLayers({
  phase,
  film,
  startTitle,
  name,
  tagline,
  h1Ref,
  pRef,
  h1Class,
  pClass,
}: {
  phase: IntroPhase;
  film: IntroFilm | undefined;
  startTitle: () => void;
  name: string;
  tagline: string;
  h1Ref: RefObject<HTMLElement | null>;
  pRef: RefObject<HTMLElement | null>;
  h1Class: string;
  pClass: string;
}) {
  const { t } = useI18n();
  const progress = useRef<HTMLElement>(null);
  if (!film || phase === "page") return null;
  const covered = phase === "unknown";
  return (
    <>
      <div
        className={cn("cc-intro", phase === "leave" && "is-leaving")}
        aria-hidden
        onPointerDown={() => phase === "film" && startTitle()}
      >
        {!covered && <IntroVideo film={film} onTitle={startTitle} progress={progress} />}
        <div className="cc-bar cc-bar--top" />
        <div className="cc-bar cc-bar--bottom" />
        <div className="cc-dim" />
        <div className="cc-progress">
          <i ref={progress} />
        </div>
        <div className="cc-flash" />
        <IntroCopy name={name} tagline={tagline} h1Ref={h1Ref} pRef={pRef} h1Class={h1Class} pClass={pClass} />
      </div>
      {(phase === "film" || covered) && (
        <button type="button" className="cc-skip focus-ring" onClick={startTitle}>
          {t("opening.skip")}
        </button>
      )}
    </>
  );
}
