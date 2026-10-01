"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gsap, prefersReducedMotion, PREMIUM_EASE } from "@/lib/gsap";
import { GoldLogo } from "@/components/intro/GoldLogo";
import { GoldRing, RING_RADIUS, RING_CIRCUMFERENCE } from "@/components/intro/GoldRing";

// Must match Hero.tsx's HERO_IMAGE.src. Duplicated as a plain string rather
// than imported, since Hero.tsx needs useIntro from this file — importing
// the other way would create a circular module dependency.
const HERO_IMAGE_SRC = "/images/exteriors/exterior-hero-wide.jpg";

const SESSION_FLAG = "js_intro_seen";
const FOUNDED_YEAR = 1994;
const COUNT_DURATION = 3; // seconds, exact — the counter never follows real load progress

type IntroState = { ready: boolean; instant: boolean };
const IntroContext = createContext<IntroState>({ ready: true, instant: true });

/**
 * `ready` flips true once the intro has finished (or was skipped outright).
 * `instant` is true only when the preloader never rendered at all (a repeat
 * visit this session, in production) — Hero uses it to snap straight to its
 * final state instead of running its entrance. Reduced motion still shows a
 * brief simple fade (per spec) so it isn't folded into `instant`; Hero's own
 * reduced-motion handling covers its entrance separately.
 */
export function useIntro() {
  return useContext(IntroContext);
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IntroState>({ ready: false, instant: false });

  useLayoutEffect(() => {
    // Dev shows the intro on every reload (so it's easy to iterate on); prod
    // gates it to once per session.
    if (process.env.NODE_ENV === "development") return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_FLAG) === "1";
    } catch {
      seen = false;
    }
    // Post-mount sync from sessionStorage (browser-only): the first render must match the
    // server's, and a layout effect applies this before paint, so there is no flash.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate hydration-safe sync
    if (seen) setState({ ready: true, instant: true });
  }, []);

  // Stable identity: Preloader's effect depends on this, so a fresh closure
  // per render (e.g. from an unrelated ancestor re-render) would otherwise
  // restart the whole sequence.
  const handleDone = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_FLAG, "1");
    } catch {
      // Private-mode/blocked storage — the intro just replays next time.
    }
    setState({ ready: true, instant: false });
  }, []);

  return (
    <IntroContext.Provider value={state}>
      {!state.ready && <Preloader onDone={handleDone} />}
      {children}
    </IntroContext.Provider>
  );
}

function Preloader({ onDone }: { onDone: () => void }) {
  const topPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoWrapRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const ringCircleRef = useRef<SVGCircleElement>(null);
  const outerRingRef = useRef<SVGCircleElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const brandTextRef = useRef<HTMLDivElement>(null);
  const cornerLeftRef = useRef<HTMLDivElement>(null);
  const cornerRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lock scrolling (and Lenis with it, since Lenis reads the same
    // documentElement) while the preloader is visible.
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const paths = logoRef.current?.querySelectorAll<SVGPathElement>("path") ?? [];
    const setCounter = (value: number) => {
      if (counterRef.current) counterRef.current.textContent = String(Math.round(value)).padStart(3, "0");
    };
    const setRingProgress = (t: number) => {
      if (ringCircleRef.current) {
        ringCircleRef.current.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - t));
      }
      if (dotRef.current) {
        const angle = -Math.PI / 2 + t * Math.PI * 2;
        const c = 130; // half of GoldRing's 260 viewBox
        dotRef.current.setAttribute("cx", String(c + RING_RADIUS * Math.cos(angle)));
        dotRef.current.setAttribute("cy", String(c + RING_RADIUS * Math.sin(angle)));
      }
    };

    gsap.set(ringCircleRef.current, { strokeDasharray: RING_CIRCUMFERENCE, strokeDashoffset: RING_CIRCUMFERENCE });
    setCounter(0);

    let cancelled = false;
    let breathTween: gsap.core.Tween | null = null;

    function runExit() {
      if (cancelled) return;
      breathTween?.kill();

      const exit = gsap.timeline({ onComplete: onDone });
      // Closing pulse on the ring, then dot fades, right as the hold ends.
      exit.to(outerRingRef.current, { filter: "drop-shadow(0 0 0px #C9A45C)", duration: 0 }, 0);
      exit.to(
        outerRingRef.current,
        { filter: "drop-shadow(0 0 12px #C9A45C)", duration: 0.3, yoyo: true, repeat: 1 },
        0
      );
      exit.to(dotRef.current, { opacity: 0, duration: 0.3 }, 0);
      // Counter + brand text + corner texts fade out.
      exit.to(
        [counterRef.current, brandTextRef.current, cornerLeftRef.current, cornerRightRef.current],
        { opacity: 0, y: -10, duration: 0.4 },
        0
      );
      // Logo + ring scale down and fade together.
      exit.to(logoWrapRef.current, { scale: 0.96, opacity: 0, duration: 0.6 }, 0.1);
      // Panels split top/bottom, revealing the hero underneath.
      exit.to(topPanelRef.current, { yPercent: -100, duration: 1.1, ease: PREMIUM_EASE }, 0.5);
      exit.to(bottomPanelRef.current, { yPercent: 100, duration: 1.1, ease: PREMIUM_EASE }, 0.5);
    }

    if (prefersReducedMotion()) {
      // A brief simple fade instead of the full choreography.
      setCounter(100);
      gsap.set(ringCircleRef.current, { strokeDashoffset: 0 });
      gsap.set(brandTextRef.current, { opacity: 1, y: 0 });
      const tl = gsap.timeline({
        onComplete: () => {
          const exit = gsap.timeline({ onComplete: onDone });
          exit.to(contentRef.current, { opacity: 0, duration: 0.5 }, 0);
          exit.to([topPanelRef.current, bottomPanelRef.current], { opacity: 0, duration: 0.5 }, 0);
        },
      });
      tl.to(contentRef.current, { opacity: 1, duration: 0.3 });
      return () => {
        cancelled = true;
        tl.kill();
      };
    }

    // --- Full sequence (B2) ---
    const tl = gsap.timeline();

    // Logo draw-in: stroke-dashoffset per path, 0 → 1.2s.
    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
    tl.to(paths, { strokeDashoffset: 0, duration: 1.2, ease: "power3.out", stagger: 0.06 }, 0);

    // Outer dashed ring fades in, then rotates slowly forever.
    gsap.set(outerRingRef.current, { opacity: 0, transformOrigin: "50% 50%" });
    tl.to(outerRingRef.current, { opacity: 1, duration: 1.2, ease: "power2.out" }, 0);
    gsap.to(outerRingRef.current, {
      rotation: 360,
      duration: 60,
      ease: "none",
      repeat: -1,
      transformOrigin: "50% 50%",
    });

    // Counter 000 → 100 over exactly 3s, main ring draws in sync, dot rides the tip.
    const progress = { t: 0, count: 0 };
    tl.to(
      progress,
      {
        t: 1,
        count: 100,
        duration: COUNT_DURATION,
        ease: "power1.inOut",
        onUpdate: () => {
          setCounter(progress.count);
          setRingProgress(progress.t);
        },
      },
      0.3
    );

    // Diagonal light sweep over the logo, twice.
    if (sweepRef.current) {
      gsap.set(sweepRef.current, { xPercent: -150 });
      tl.to(sweepRef.current, { xPercent: 150, duration: 1, ease: "power2.inOut", repeat: 1, repeatDelay: 0.15 }, 1.2);
    }

    // Corner texts fade in, and the centered brand label below the counter.
    tl.to([cornerLeftRef.current, cornerRightRef.current], { opacity: 0.5, y: 0, duration: 0.6 }, 0.6);
    tl.to(brandTextRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.6);

    tl.call(
      () => {
        if (cancelled) return;
        // Hold at 100, breathing, until real readiness (below) says go.
        breathTween = gsap.to(contentRef.current, {
          opacity: 0.85,
          duration: 1,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      },
      [],
      COUNT_DURATION + 0.3
    );

    // Real readiness gate — independent of the (purely time-based) counter.
    const fontsReady = "fonts" in document ? document.fonts.ready : Promise.resolve();
    const loadReady = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });
    const heroImageReady = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = HERO_IMAGE_SRC;
    });

    Promise.all([fontsReady, loadReady, heroImageReady]).then(() => {
      if (cancelled) return;
      // Never exit before the counter/ring have actually finished their 3s draw.
      const remaining = Math.max(tl.duration() - tl.time(), 0) * 1000;
      setTimeout(runExit, remaining);
    });

    return () => {
      cancelled = true;
      tl.kill();
      breathTween?.kill();
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[100]">
      <div ref={topPanelRef} className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div ref={bottomPanelRef} className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />

      {/* Very subtle film grain — a static noise texture, not animated. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' fill='%23ffffff'/%3E%3C/svg%3E\")",
        }}
      />

      <div role="status" className="sr-only">
        Loading
      </div>

      <div ref={contentRef} aria-hidden className="absolute inset-0 flex flex-col items-center justify-center gap-8">
        <div
          ref={logoWrapRef}
          className="relative flex h-[200px] w-[200px] items-center justify-center sm:h-[260px] sm:w-[260px]"
        >
          <GoldRing
            circleRef={ringCircleRef}
            dotRef={dotRef}
            outerRef={outerRingRef}
            className="absolute inset-0 h-full w-full"
          />
          <div className="relative h-[120px] w-[120px] overflow-hidden sm:h-[160px] sm:w-[160px]">
            <GoldLogo ref={logoRef} className="h-full w-full" />
            <div
              ref={sweepRef}
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: "linear-gradient(115deg, transparent 40%, rgba(230,207,154,0.4) 50%, transparent 60%)",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <span ref={counterRef} className="mono-stat text-sm text-gold">
            000
          </span>
          <div ref={brandTextRef} className="eyebrow text-gold opacity-0">
            Javor Sped
          </div>
        </div>
      </div>

      <div
        ref={cornerLeftRef}
        aria-hidden
        className="eyebrow absolute bottom-6 left-6 text-[11px] text-gold/50 opacity-0"
        style={{ letterSpacing: "0.3em" }}
      >
        Javor Sped
      </div>
      <div
        ref={cornerRightRef}
        aria-hidden
        className="eyebrow absolute bottom-6 right-6 text-[11px] text-gold/50 opacity-0"
        style={{ letterSpacing: "0.3em" }}
      >
        Est. {FOUNDED_YEAR}
      </div>
    </div>
  );
}
