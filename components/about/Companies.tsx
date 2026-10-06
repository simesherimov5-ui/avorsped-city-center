"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { MAX_DESCRIPTION, THIS_COMPANY, type Company } from "@/components/company-ticker/companies";
import { truncate } from "@/lib/truncate";
import { sideOf } from "./companies-layout";

/** How long a company stays selected before autoplay moves on to the next one. */
export const AUTO_MS = 7000;
/** How long a company the visitor chose stays selected, so there is time to read it. */
const CLICK_HOLD_MS = 20000;
/** The centre's crossfade: the old content fades out first, then the new one fades in. */
const FADE_MS = 220;

const pad = (n: number) => String(n).padStart(2, "0");

function Arrow() {
  return (
    <svg
      width="18"
      height="10"
      viewBox="0 0 18 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M0 5h17M13 1l4 4-4 4" />
    </svg>
  );
}

/** The description and the link: each only when the company has one (no placeholder text, no empty link). */
function Details({ company }: { company: Company }) {
  return (
    <>
      {company.description && <p className="co-desc">{truncate(company.description, MAX_DESCRIPTION)}</p>}
      {company.url && (
        <a className="co-more" href={company.url} target="_blank" rel="noopener noreferrer">
          Посети ја страницата <Arrow />
          <span className="sr-only"> (се отвора во нов прозорец)</span>
        </a>
      )}
    </>
  );
}

/**
 * "Дел од Јавор Шпед": the group's companies as points on a gold ring; the selected one is described in the middle.
 * The selection moves on by itself every AUTO_MS (a thin arc around the selected point shows the time left), and
 * waits while the mouse is over the circle, keyboard focus is inside it, it is less than half on screen, the tab is
 * hidden, or the visitor pressed pause. A company the visitor picks stays for CLICK_HOLD_MS. With reduced motion
 * there is no autoplay, no arc and no pause button: everything is simply shown.
 *
 * The points are placed in CSS from their number and the company count, so adding or removing a company still gives
 * an even ring. The first company is at the top, the rest follow clockwise.
 */
export function Companies({ eyebrow, companies }: { eyebrow: string; companies: Company[] }) {
  const count = companies.length;
  const [active, setActive] = useState(0); // the selected point
  const [shown, setShown] = useState(0); // the company whose text is in the middle (follows `active` after the fade)
  const [fading, setFading] = useState(false);
  const [timerKey, setTimerKey] = useState(0); // bumps to restart the timer when the same point is chosen again
  const [userPaused, setUserPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [entered, setEntered] = useState(false);

  const stage = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const tween = useRef<gsap.core.Tween | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hold = useRef(AUTO_MS); // how long the next timer runs
  const activeRef = useRef(0);
  const pausedRef = useRef(true);

  const paused = userPaused || hover || keyboardFocus || !onScreen || tabHidden || !entered;

  /** Selects a company. `byVisitor`: a click, a tap or the keyboard (not autoplay), which earns the longer stay. */
  const select = useCallback((index: number, byVisitor: boolean) => {
    hold.current = byVisitor ? CLICK_HOLD_MS : AUTO_MS;
    const same = index === activeRef.current;
    activeRef.current = index;
    setActive(index);
    setTimerKey((k) => k + 1); // the timer starts over, even when the same point is chosen again
    if (same) return; // nothing to swap, so no fade
    clearTimeout(fadeTimer.current);
    if (prefersReducedMotion()) {
      setShown(index);
      setFading(false);
      return;
    }
    setFading(true);
    fadeTimer.current = setTimeout(() => {
      setShown(index);
      setFading(false);
    }, FADE_MS);
  }, []);

  // Entrance, once, when the circle scrolls into view: the ring draws itself clockwise, the points appear one after
  // another, then the middle fades in. (Reduced motion: nothing is hidden, nothing is drawn.)
  useEffect(() => {
    const el = stage.current;
    const root = plane.current;
    if (!el || !root) return;
    const reduced = prefersReducedMotion();
    const ring = root.querySelector<SVGCircleElement>(".co-ring-line");
    const dashed = root.querySelector<HTMLElement>(".co-dashed");
    const points = root.querySelectorAll<HTMLElement>(".co-n");
    const centre = root.querySelector<HTMLElement>(".co-center");
    const animate = !reduced && !!ring && !!dashed && !!centre;
    if (animate) {
      gsap.set(ring, { attr: { "stroke-dashoffset": 1 } });
      gsap.set(dashed, { opacity: 0 });
      gsap.set(points, { opacity: 0, scale: 0.6 });
      gsap.set(centre, { opacity: 0 });
    }
    let tl: gsap.core.Timeline | undefined;
    const seen = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        seen.disconnect();
        if (!animate) {
          setEntered(true);
          return;
        }
        tl = gsap.timeline({ onComplete: () => setEntered(true) });
        tl.to(ring, { attr: { "stroke-dashoffset": 0 }, duration: 1.4, ease: "power2.inOut" }, 0)
          .to(dashed, { opacity: 1, duration: 1, ease: "power2.out" }, 0.3)
          .to(points, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out", stagger: 0.08 }, 0.3)
          .to(centre, { opacity: 1, duration: 0.7, ease: "power2.out" }, 1.3);
      },
      { threshold: 0.3 }
    );
    seen.observe(el);
    return () => {
      seen.disconnect();
      tl?.kill();
    };
  }, []);

  // Autoplay needs the circle at least half on screen and the tab in front.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const half = new IntersectionObserver(
      (entries) => setOnScreen(entries[entries.length - 1].intersectionRatio >= 0.5),
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    half.observe(el);
    const onVisibility = () => setTabHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      half.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Pausing freezes the arc where it is; resuming carries on from there.
  useEffect(() => {
    pausedRef.current = paused;
    tween.current?.paused(paused);
  }, [paused]);

  // The timer: a 1px arc draws around the selected point; when it closes the next company is selected. (The dash
  // offset is animated as an attribute: as a CSS property GSAP would round it to whole pixels, and it only runs 1 → 0.)
  useEffect(() => {
    const circle = arc.current;
    if (!circle || prefersReducedMotion()) return;
    const ms = hold.current;
    hold.current = AUTO_MS;
    const t = gsap.fromTo(
      circle,
      { attr: { "stroke-dashoffset": 1 } },
      {
        attr: { "stroke-dashoffset": 0 },
        duration: ms / 1000,
        ease: "none",
        paused: pausedRef.current,
        onComplete: () => select((activeRef.current + 1) % count, false),
      }
    );
    tween.current = t;
    return () => {
      t.kill();
      if (tween.current === t) tween.current = null;
    };
  }, [active, timerKey, count, select]);

  useEffect(() => () => clearTimeout(fadeTimer.current), []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const from = buttons.current.findIndex((b) => b === document.activeElement);
    if (from < 0) return;
    e.preventDefault();
    const to = (from + (e.key === "ArrowRight" ? 1 : count - 1)) % count;
    select(to, true);
    buttons.current[to]?.focus();
  };

  const company = companies[shown];

  return (
    <div className="co" style={{ "--n": count } as CSSProperties}>
      <div className="bk-eyebrow is-center">{eyebrow}</div>
      <div className="co-wrap">
        <div
          ref={stage}
          className="co-stage"
          role="group"
          aria-label={eyebrow}
          onKeyDown={onKeyDown}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
          onFocus={(e) => setKeyboardFocus(e.target.matches(":focus-visible"))}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setKeyboardFocus(false);
          }}
        >
          <div ref={plane} className="co-plane">
            <svg className="co-ring" aria-hidden="true">
              <circle className="co-ring-line" cx="50%" cy="50%" r="49.9%" pathLength="1" strokeDasharray="1" />
            </svg>
            <span className="co-dashed" aria-hidden="true" />

            {companies.map((c, i) => (
              <button
                key={c.name}
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                type="button"
                className={`co-n${i === active ? " is-on" : ""}`}
                style={{ "--k": i } as CSSProperties}
                data-side={sideOf(i, count)}
                aria-pressed={i === active}
                aria-label={c.name}
                onClick={() => select(i, true)}
              >
                <span className="co-dot" aria-hidden="true" />
                <span className="co-ix bk-mono" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <span className="co-lb">{c.name}</span>
                {i === active && (
                  <svg className="co-arc" aria-hidden="true">
                    <circle
                      ref={arc}
                      cx="50%"
                      cy="50%"
                      r="49.9%"
                      pathLength="1"
                      strokeDasharray="1"
                      strokeDashoffset="1"
                    />
                  </svg>
                )}
              </button>
            ))}

            <div className="co-center" aria-live="polite" aria-atomic="true">
              <div className={`co-in${fading ? " is-out" : ""}`}>
                <div className="co-k bk-mono">
                  {pad(shown + 1)} / {pad(count)}
                </div>
                <h3 className="co-name bk-serif">{company.name}</h3>
                {company.name === THIS_COMPANY && <span className="co-me">Оваа компанија</span>}
                <div className="co-text">
                  <Details company={company} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="co-toggle"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused ? "Продолжи ја автоматската промена" : "Паузирај ја автоматската промена"}
        >
          {userPaused ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
              <path d="M1 0.8v12.4L11 7z" />
            </svg>
          ) : (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
              <path d="M1 1h3.2v12H1zM7.8 1H11v12H7.8z" />
            </svg>
          )}
        </button>
      </div>

      <div className={`co-below${fading ? " is-out" : ""}`}>
        <Details company={company} />
      </div>
    </div>
  );
}
