"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, CALM_EASE, PREMIUM_EASE } from "@/lib/gsap";
import "./javor-sped-intro.css";

type Props = {
  /** Called the moment the black screen starts to open: start the hero text entrance here. */
  onReveal?: () => void;
  /** Called when the intro is completely finished and removed. */
  onDone?: () => void;
  /** The opening holds (just before the mark lifts away) until this resolves, e.g. the hero photo is loaded. */
  waitFor?: () => Promise<void>;
};

/**
 * The mark of the building, drawn stroke by stroke. Frame, spine and the ten slats on each side; `delay` is when
 * a stroke starts (seconds), `opacity` where it ends. Left slats run top to bottom 0.09s apart, each right slat
 * follows its left partner by 0.05s and rests at 60%.
 */
const SLAT_ROWS = Array.from({ length: 10 }, (_, i) => 136 + i * 18);
const STROKES: { d: string; delay: number; opacity: number }[] = [
  { d: "M60 300 V70 H110", delay: 0, opacity: 1 },
  { d: "M134 300 V62", delay: 0.05, opacity: 1 },
  ...SLAT_ROWS.flatMap((y, i) => [
    { d: `M70 ${y} L128 ${y - 26}`, delay: i * 0.09, opacity: 1 },
    { d: `M140 ${y - 30} L200 ${y}`, delay: i * 0.09 + 0.05, opacity: 0.6 },
  ]),
];

/**
 * Homepage opening on a black screen (about 2.6 seconds before it opens):
 * 1. The building draws itself in Светол бакар: frame, spine, then the slats from the top down.
 * 2. "JAVOR SPED" fades in under it while its letters spread apart; "HOLDING" follows under the name.
 * 3. A short hold, then the mark and the name lift away as the black screen opens exactly as the site always has:
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

      gsap.set(q(".jsi-hold"), { opacity: 0, y: 8 });
      gsap.set(q(".jsi-word"), { opacity: 0, letterSpacing: "0.2em", paddingLeft: "0.2em" });

      let tl: gsap.core.Timeline | null = null;
      let cancelled = false;
      const run = () => {
        if (cancelled) return;
        const t = gsap.timeline();
        tl = t;
        // 1 · the building draws itself: each stroke fades in while it slides 10px into place
        q(".jsi-st").forEach((stroke) => {
          const { delay, opacity } = (stroke as HTMLElement).dataset;
          t.fromTo(
            stroke,
            { opacity: 0, x: -10 },
            { opacity: Number(opacity), x: 0, duration: 0.6, ease: CALM_EASE },
            Number(delay)
          );
        });
        t
          // 2 · the name opens up under the mark (the padding keeps the trailing letter-space from pulling it off-centre)
          .to(
            q(".jsi-word"),
            { opacity: 1, letterSpacing: "0.5em", paddingLeft: "0.5em", duration: 0.85, ease: CALM_EASE },
            1.3
          )
          // "HOLDING" fades in and rises 8px under the name as it settles
          .to(q(".jsi-hold"), { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 1.95)
          // Hold here (0.4s after the name is complete), and if needed until the hero photo underneath is loaded and decoded.
          .add(() => {
            if (!waitFor) return;
            t.pause();
            waitFor().then(() => {
              if (!cancelled) t.resume();
            });
          }, 2.55)
          // 3 · the mark and the name lift away as the screen opens: top half up, bottom half down
          .to(q(".jsi-lock"), { opacity: 0, y: -18, duration: 0.6, ease: "power2.in" }, 2.6)
          .add(() => onReveal?.(), 2.6)
          .to(q(".jsi-bg-top"), { yPercent: -100, duration: 1.1, ease: PREMIUM_EASE }, 2.6)
          .to(q(".jsi-bg-bot"), { yPercent: 100, duration: 1.1, ease: PREMIUM_EASE }, 2.6)
          .add(finish, 3.7);
      };
      // wait for the fonts so the name is measured with the right letters
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
    <div ref={root} className="jsi" role="img" aria-label="Javor Sped Holding">
      <div className="jsi-bg-top" />
      <div className="jsi-bg-bot" />
      <div className="jsi-stage">
        <div className="jsi-lock">
          <svg className="jsi-mark" viewBox="50 60 170 240" aria-hidden>
            {STROKES.map((s) => (
              <path key={s.d} className="jsi-st" d={s.d} data-delay={s.delay} data-opacity={s.opacity} />
            ))}
          </svg>
          <div className="jsi-name">
            <span className="jsi-word">JAVOR SPED</span>
            <div className="jsi-hold">HOLDING</div>
          </div>
        </div>
      </div>
    </div>
  );
}
