"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, PREMIUM_EASE } from "@/lib/gsap";
import { LOGO_GRADIENT, LOGO_PATH, LOGO_TRANSFORM, LOGO_VIEWBOX } from "./logo-mark";
import "./javor-sped-intro.css";

type Props = {
  /** Called the moment the black screen starts to open: start the hero text entrance here. */
  onReveal?: () => void;
  /** Called when the intro is completely finished and removed. */
  onDone?: () => void;
  /** The opening holds (just before the wordmark lifts away) until this resolves, e.g. the hero photo is loaded. */
  waitFor?: () => Promise<void>;
};

/**
 * Homepage opening sequence on a black screen (about 7 seconds):
 * 1. The logo loads inside a gold ring that draws as a 000–100 counter runs
 * 2. The logo fades and "JS" rises into the ring
 * 3. JS → JAVOR (the S steps out, AVOR unfolds after the J)
 * 4. JAVOR → JAVOR-SPED
 * 5. The wordmark lifts away, then the black screen opens exactly as the site always has:
 *    top half up, bottom half down, 1.1s on the "premium" curve.
 * The hero photo is already rendered underneath; this only uncovers it.
 */
export default function JavorSpedIntro({ onReveal, onDone, waitFor }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  // Page scrolling stays locked for as long as the intro is on screen.
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const finish = () => {
        setGone(true);
        onDone?.();
      };
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        onReveal?.();
        finish();
        return;
      }

      const prog = el.querySelector(".jsi-ring-prog") as SVGCircleElement;
      const count = el.querySelector(".jsi-count") as HTMLElement;
      const len = 2 * Math.PI * 72;
      const c = { v: 0 };
      gsap.set(prog, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(q(".jsi-j, .jsi-s"), { yPercent: 60, opacity: 0 });
      gsap.set(q(".jsi-logo"), { opacity: 0, scale: 0.92, transformOrigin: "50% 50%" });

      let tl: gsap.core.Timeline | null = null;
      let cancelled = false;
      const run = () => {
        if (cancelled) return;
        const t = gsap.timeline();
        // Phones get a brisker sequence (about 6s instead of 7.4s).
        if (window.innerWidth < 768) t.timeScale(1.25);
        tl = t;
        t
          // 1 · the logo loads inside the ring
          .to(q(".jsi-logo"), { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }, 0.15)
          .to(prog, { strokeDashoffset: 0, duration: 1.8, ease: "power1.inOut" }, 0.2)
          .to(
            c,
            {
              v: 100,
              duration: 1.8,
              ease: "power1.inOut",
              onUpdate: () => {
                count.textContent = String(Math.round(c.v)).padStart(3, "0");
              },
            },
            0.2
          )
          .to(q(".jsi-count"), { opacity: 0, duration: 0.4 }, 2.0)
          .to(q(".jsi-logo"), { opacity: 0, scale: 0.94, duration: 0.45, ease: "power2.in" }, 2.05)
          // 2 · JS rises into the ring
          .to(q(".jsi-j"), { yPercent: 0, opacity: 1, duration: 0.65, ease: "power3.out" }, 2.45)
          .to(q(".jsi-s"), { yPercent: 0, opacity: 1, duration: 0.65, ease: "power3.out" }, 2.6)
          .to(
            q(".jsi-ring"),
            { opacity: 0, scale: 1.12, duration: 0.5, ease: "power2.in", transformOrigin: "50% 50%" },
            3.35
          )
          // 3 · JS → JAVOR
          .to(q(".jsi-s"), { width: 0, opacity: 0, duration: 0.6, ease: "power3.inOut" }, 3.6)
          .to(q(".jsi-avor"), { width: "auto", opacity: 1, duration: 0.9, ease: "power3.inOut" }, 3.6)
          // 4 · JAVOR → JAVOR-SPED
          .to(
            q(".jsi-dash"),
            {
              width: "auto",
              opacity: 1,
              paddingLeft: ".1em",
              paddingRight: ".1em",
              duration: 0.5,
              ease: "power3.inOut",
            },
            4.7
          )
          .to(q(".jsi-s"), { width: "auto", opacity: 1, duration: 0.6, ease: "power3.inOut" }, 4.8)
          .to(q(".jsi-ped"), { width: "auto", opacity: 1, duration: 0.8, ease: "power3.inOut" }, 4.9)
          // Hold here, if needed, until the hero photo underneath is loaded and decoded.
          .add(() => {
            if (!waitFor) return;
            t.pause();
            waitFor().then(() => {
              if (!cancelled) t.resume();
            });
          }, 5.9)
          // 5 · the wordmark lifts away, then the screen opens: top half up, bottom half down
          .to(q(".jsi-wm"), { opacity: 0, y: -18, duration: 0.6, ease: "power2.in" }, 6.0)
          .add(() => onReveal?.(), 6.3)
          .to(q(".jsi-bg-top"), { yPercent: -100, duration: 1.1, ease: PREMIUM_EASE }, 6.3)
          .to(q(".jsi-bg-bot"), { yPercent: 100, duration: 1.1, ease: PREMIUM_EASE }, 6.3)
          .add(finish, 7.4);
      };
      // wait for the fonts so the letter widths are measured correctly
      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
      (fonts ? fonts.ready : Promise.resolve()).then(run);

      return () => {
        cancelled = true;
        tl?.kill();
      };
    },
    { scope: root }
  );

  if (gone) return null;
  return (
    <div ref={root} className="jsi" aria-hidden="true">
      <div className="jsi-bg-top" />
      <div className="jsi-bg-bot" />
      <svg className="jsi-ring" viewBox="0 0 150 150">
        <circle className="jsi-ring-base" cx="75" cy="75" r="72" />
        <circle className="jsi-ring-prog" cx="75" cy="75" r="72" />
      </svg>
      <svg className="jsi-logo" viewBox={LOGO_VIEWBOX}>
        <defs>
          <linearGradient id="introGold" gradientUnits="userSpaceOnUse" {...LOGO_GRADIENT}>
            <stop offset="0" style={{ stopColor: "var(--color-gold-dark)" }} />
            <stop offset=".4" style={{ stopColor: "var(--color-gold)" }} />
            <stop offset=".65" style={{ stopColor: "var(--color-gold-light)" }} />
            <stop offset="1" style={{ stopColor: "var(--color-gold)" }} />
          </linearGradient>
        </defs>
        <path transform={LOGO_TRANSFORM} fill="url(#introGold)" d={LOGO_PATH} />
      </svg>
      <div className="jsi-count">000</div>
      <div className="jsi-stage">
        <div className="jsi-wm">
          <span className="jsi-gold jsi-j">J</span>
          <span className="jsi-gold jsi-x jsi-avor">AVOR</span>
          <span className="jsi-gold jsi-x jsi-dash">-</span>
          <span className="jsi-gold jsi-s">S</span>
          <span className="jsi-gold jsi-x jsi-ped">PED</span>
        </div>
      </div>
    </div>
  );
}
