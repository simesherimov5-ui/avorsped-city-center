"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { useIntro } from "@/components/intro/IntroProvider";
import { pageName } from "./page-names";

/**
 * Every timing of the curtain, in seconds (the one place to tune it). The curtain is a plain wipe: it rises over the old
 * page, the new page is put in place underneath, and it carries on up and off to uncover it. Nothing fades in over the
 * dark, so no half-transparent page ever shows against the curtain's colour. About 1.5s on a desktop with the next page
 * ready; phones play the same timeline faster.
 */
export const TRANSITION = {
  coverDuration: 0.55, // the ink panel rises over the old page
  coverEase: "power3.inOut",
  nameInDuration: 0.35, // the destination's name fades up in gold…
  nameInOverlap: 0.2, // …starting this long before the panel has finished rising
  ruleWidth: 120, // px — the 1px gold line drawn under the name
  ruleDuration: 0.4,
  holdAfterRoute: 0.1, // fully covered, new page in place, before the name leaves
  nameOutDuration: 0.2,
  revealDuration: 0.65, // the panel continues up and off the top
  revealOverlap: 0.1,
  readyAfterReveal: 0.2, // pages that animate their own entrance start this long into the reveal
  phoneTimeScale: 1.25,
  routeTimeoutMs: 8000, // never leave the curtain down forever if a page fails to load
} as const;

type TransitionApi = {
  /** Starts the curtain, waits until the screen is covered, then changes route. */
  navigate: (href: string) => void;
  /** The pathname being navigated to while a transition runs (so the navbar line can slide early). */
  target: string | null;
};

const PageTransitionContext = createContext<TransitionApi | null>(null);

/** `null` outside the provider: links then fall back to plain Next navigation. */
export function usePageTransition() {
  return useContext(PageTransitionContext);
}

/**
 * True once the page is on screen: false while the curtain covers it (a page that has just been routed to is already
 * mounted underneath), true again as the curtain starts to clear, and always true on a first load or outside the
 * provider. Entrance animations wait for it, so they play in view instead of behind the curtain.
 */
export function usePageReady() {
  const api = useContext(PageTransitionContext);
  return api === null || api.target === null;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready } = useIntro();
  const [target, setTarget] = useState<string | null>(null);

  const curtainRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const arrivalRef = useRef<{ path: string; resolve: () => void } | null>(null);
  const pathRef = useRef(pathname);
  const readyRef = useRef(ready);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  // The curtain starts parked below the screen. Its start position is set with GSAP (never a CSS percentage
  // transform), otherwise GSAP's yPercent would stack on top of it and strand the panel over the page.
  useEffect(() => {
    if (curtainRef.current) gsap.set(curtainRef.current, { yPercent: 100 });
    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  // A new route has rendered: release the waiting curtain. (Browser back and forward swap pages with no curtain and no fade.)
  useEffect(() => {
    pathRef.current = pathname;
    const arrival = arrivalRef.current;
    if (arrival && arrival.path === pathname) {
      arrivalRef.current = null;
      arrival.resolve();
    }
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      if (busyRef.current) return; // clicks during a transition are ignored
      const url = new URL(href, window.location.href);
      if (url.pathname === pathRef.current && url.search === window.location.search) return; // already here
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Reduced motion, and the homepage intro (which has its own opening), never get the curtain.
      if (reduced || !readyRef.current) {
        router.push(href);
        return;
      }
      const curtain = curtainRef.current;
      const nameEl = nameRef.current;
      const rule = ruleRef.current;
      if (!curtain || !nameEl || !rule) {
        router.push(href);
        return;
      }

      const C = TRANSITION;
      router.prefetch(url.pathname + url.search); // on touch screens there was no hover to start this
      busyRef.current = true;
      setTarget(url.pathname);
      nameEl.textContent = pageName(url.pathname);
      gsap.set(curtain, { yPercent: 100, visibility: "visible", pointerEvents: "auto" });
      gsap.set(rule, { width: 0 });
      gsap.set(nameEl, { opacity: 0, y: 12 });

      const finish = () => {
        gsap.set(curtain, { yPercent: 100, visibility: "hidden", pointerEvents: "none" });
        busyRef.current = false;
        setTarget(null);
      };
      const tl = gsap.timeline({ onComplete: finish });
      timelineRef.current = tl;
      if (window.innerWidth < 768) tl.timeScale(C.phoneTimeScale);

      tl.to(curtain, { yPercent: 0, duration: C.coverDuration, ease: C.coverEase })
        .to(nameEl, { opacity: 1, y: 0, duration: C.nameInDuration, ease: "power2.out" }, `-=${C.nameInOverlap}`)
        .to(rule, { width: C.ruleWidth, duration: C.ruleDuration, ease: "power2.inOut" }, "<")
        // Fully covered: change the route, and keep the curtain down until the new page has rendered.
        .add(() => {
          tl.pause();
          const arrived = new Promise<void>((resolve) => {
            if (url.pathname === pathRef.current)
              setTimeout(resolve, 400); // same page, new query string
            else arrivalRef.current = { path: url.pathname, resolve };
            setTimeout(resolve, C.routeTimeoutMs);
          });
          router.push(href);
          arrived.then(() => {
            arrivalRef.current = null;
            requestAnimationFrame(() =>
              requestAnimationFrame(() => {
                window.scrollTo({ top: 0, left: 0, behavior: "instant" }); // scroll resets while covered
                tl.resume();
              })
            );
          });
        })
        .to(nameEl, { opacity: 0, y: -10, duration: C.nameOutDuration, ease: "power2.in" }, `+=${C.holdAfterRoute}`)
        .to(curtain, { yPercent: -100, duration: C.revealDuration, ease: C.coverEase }, `-=${C.revealOverlap}`)
        // Pages that play their own entrance wait for this (usePageReady): it starts as the curtain clears.
        .add(() => setTarget(null), `<${C.readyAfterReveal}`);
    },
    [router]
  );

  const api = useMemo<TransitionApi>(() => ({ navigate, target }), [navigate, target]);

  return (
    <PageTransitionContext.Provider value={api}>
      {children}
      {/* Above the page, the footer and the phone menu; below the navbar (z-50), which stays on top. */}
      <div
        ref={curtainRef}
        aria-hidden
        className="pointer-events-none invisible fixed inset-0 z-[45] flex flex-col items-center justify-center bg-ink"
      >
        <div ref={nameRef} className="pl-[0.4em] text-[13px] font-medium uppercase tracking-[0.4em] text-gold" />
        <div ref={ruleRef} className="mt-[18px] h-px w-0 bg-gold" />
      </div>
    </PageTransitionContext.Provider>
  );
}
