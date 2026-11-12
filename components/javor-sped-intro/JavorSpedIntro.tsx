"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, CALM_EASE, PREMIUM_EASE } from "@/lib/gsap";
import { MARK_STROKES, MARK_VIEWBOX } from "@/lib/logo-mark";
import { lockScroll } from "@/lib/scroll-lock";
import { HOLDING_GLYPHS, WORDMARK_GLYPHS, type GlyphGroup } from "./wordmark-glyphs";
import "./javor-sped-intro.css";

type Props = {
  /** Called the moment the black screen starts to open: start the hero text entrance here. */
  onReveal?: () => void;
  /** Called when the intro is completely finished and removed. */
  onDone?: () => void;
  /** The opening holds (just before the wordmark lifts away) until this resolves, e.g. the hero photo is loaded. */
  waitFor?: () => Promise<void>;
};

const em = (units: number) => `${units / 1000}em`;

/**
 * A part of the wordmark at the size its text had: it gives the part its width (what the "width: auto" unfolds open to)
 * and puts the part's baseline where the text's was, so the row lines up exactly as before.
 */
function GlyphBox({ g, children }: { g: GlyphGroup; children?: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 ${-g.baseline} ${g.w} ${g.h}`}
      preserveAspectRatio="none"
      // inline (the base styles make every svg a block), so the part keeps a baseline for the row to line up on
      style={{ display: "inline", width: em(g.w), height: em(g.h), verticalAlign: em(g.baseline - g.h) }}
    >
      {children}
    </svg>
  );
}

/**
 * The gold letters: the part's gold sheen shows only through the letter shapes, as it did through the text. The mask
 * keeps the letters' full size while the part unfolds, so they are uncovered, never squeezed.
 */
function goldLetters(g: GlyphGroup): CSSProperties {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${-g.baseline} ${g.w} ${g.h}" preserveAspectRatio="none"><path d="${g.d}"/></svg>`;
  const image = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  const size = `${em(g.w)} ${em(g.h)}`;
  return { maskImage: image, WebkitMaskImage: image, maskSize: size, WebkitMaskSize: size };
}

/**
 * Homepage opening sequence on a black screen (about 9.7 seconds; a click, tap, Esc, Enter or Space skips to the last step):
 * 1. The building draws itself, stroke by stroke
 * 2. The ring appears around it and draws as a 000–100 counter runs
 * 3. The building fades and "JS" rises into the ring
 * 4. JS → JAVOR (the S steps out, AVOR unfolds after the J)
 * 5. JAVOR → JAVOR SPED (two words), then "HOLDING" fades in under it
 * 6. The wordmark and "HOLDING" lift away together, as the black screen opens exactly as the site always has:
 *    top half up, bottom half down, 1.1s on the "premium" curve.
 * The hero photo is already rendered underneath; this only uncovers it.
 * The wordmark's letters are drawn shapes (wordmark-glyphs.ts), not text, so the opening needs no font of its own.
 */
export default function JavorSpedIntro({ onReveal, onDone, waitFor }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  // Page scrolling stays locked for as long as the intro is on screen.
  useEffect(() => lockScroll(), []);

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
      gsap.set(q(".jsi-hold"), { opacity: 0, y: 8 });
      gsap.set(q(".jsi-ring, .jsi-count"), { opacity: 0 });

      let tl: gsap.core.Timeline | null = null;
      let cancelled = false;
      let skipRequested = false;
      /** Where the screen starts to open: skipping jumps here, so the normal reveal plays and nothing else. */
      const REVEAL_AT = 7.4;
      /** The closing animation (the wordmark lifting away, the screen opening) is this much longer than it was, in seconds. */
      const END_EXTRA = 1.2;
      const skip = () => {
        skipRequested = true;
        // Not built yet (the fonts are still loading): `run` jumps as soon as it exists.
        if (!tl || tl.time() >= REVEAL_AT) return;
        tl.seek(REVEAL_AT - 0.01, true).resume();
      };
      const onClick = () => skip();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          skip();
        }
      };
      window.addEventListener("click", onClick);
      window.addEventListener("keydown", onKey);
      const run = () => {
        if (cancelled) return;
        const t = gsap.timeline();
        // Phones get a brisker sequence.
        if (window.innerWidth < 768) t.timeScale(1.25);
        tl = t;
        // 1 · the building draws itself: each stroke fades in while it slides 10px into place
        q(".jsi-st").forEach((stroke) => {
          const { delay, opacity } = (stroke as HTMLElement).dataset;
          t.fromTo(
            stroke,
            { opacity: 0, x: -10 },
            { opacity: Number(opacity), x: 0, duration: 0.6, ease: CALM_EASE },
            0.15 + Number(delay)
          );
        });
        t
          // 2 · the ring appears around the finished building and draws with the counter
          .to(q(".jsi-ring, .jsi-count"), { opacity: 1, duration: 0.5, ease: "power2.out" }, 1.3)
          .to(prog, { strokeDashoffset: 0, duration: 1.8, ease: "power1.inOut" }, 1.3)
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
            1.3
          )
          .to(q(".jsi-count"), { opacity: 0, duration: 0.4 }, 3.1)
          // 3 · the building fades and JS rises into the ring
          .to(
            q(".jsi-logo"),
            { opacity: 0, scale: 0.94, duration: 0.45, ease: "power2.in", transformOrigin: "50% 50%" },
            3.15
          )
          .to(q(".jsi-j"), { yPercent: 0, opacity: 1, duration: 0.65, ease: "power3.out" }, 3.55)
          .to(q(".jsi-s"), { yPercent: 0, opacity: 1, duration: 0.65, ease: "power3.out" }, 3.7)
          .to(
            q(".jsi-ring"),
            { opacity: 0, scale: 1.12, duration: 0.5, ease: "power2.in", transformOrigin: "50% 50%" },
            4.45
          )
          // 4 · JS → JAVOR
          .to(q(".jsi-s"), { width: 0, opacity: 0, duration: 0.6, ease: "power3.inOut" }, 4.7)
          .to(q(".jsi-avor"), { width: "auto", opacity: 1, duration: 0.9, ease: "power3.inOut" }, 4.7)
          // 5 · JAVOR → JAVOR SPED: a space opens between the words
          .to(q(".jsi-gap"), { width: "auto", opacity: 1, duration: 0.5, ease: "power3.inOut" }, 5.8)
          .to(q(".jsi-s"), { width: "auto", opacity: 1, duration: 0.6, ease: "power3.inOut" }, 5.9)
          .to(q(".jsi-ped"), { width: "auto", opacity: 1, duration: 0.8, ease: "power3.inOut" }, 6.0)
          // "HOLDING" fades in and rises 8px under the finished wordmark, 0.25s after JAVOR SPED is complete
          .to(q(".jsi-hold"), { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 7.05)
          // Hold here, if needed, until the hero photo underneath is loaded and decoded.
          .add(() => {
            if (!waitFor) return;
            t.pause();
            waitFor().then(() => {
              if (!cancelled) t.resume();
            });
          }, 7.35)
          // 6 · both lines lift away together as the screen opens: top half up, bottom half down
          .to(q(".jsi-lock"), { opacity: 0, y: -18, duration: 0.6 + END_EXTRA, ease: "power2.in" }, REVEAL_AT)
          .add(() => onReveal?.(), REVEAL_AT)
          .to(q(".jsi-bg-top"), { yPercent: -100, duration: 1.1 + END_EXTRA, ease: PREMIUM_EASE }, REVEAL_AT)
          .to(q(".jsi-bg-bot"), { yPercent: 100, duration: 1.1 + END_EXTRA, ease: PREMIUM_EASE }, REVEAL_AT)
          .add(finish, 8.5 + END_EXTRA);
        if (skipRequested) t.seek(REVEAL_AT - 0.01, true);
      };
      // wait for the fonts so the letter widths are measured correctly
      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
      (fonts ? fonts.ready : Promise.resolve()).then(run);

      return () => {
        cancelled = true;
        window.removeEventListener("click", onClick);
        window.removeEventListener("keydown", onKey);
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
      <svg className="jsi-ring" viewBox="0 0 150 150">
        <circle className="jsi-ring-base" cx="75" cy="75" r="72" />
        <circle className="jsi-ring-prog" cx="75" cy="75" r="72" />
      </svg>
      <svg className="jsi-logo" viewBox={MARK_VIEWBOX} aria-hidden>
        <defs>
          <linearGradient id="jsi-sheen" gradientUnits="userSpaceOnUse" x1="50" y1="60" x2="220" y2="300">
            <stop className="jsi-sheen-0" offset="0" />
            <stop className="jsi-sheen-1" offset="0.35" />
            <stop className="jsi-sheen-2" offset="0.6" />
            <stop className="jsi-sheen-3" offset="1" />
          </linearGradient>
        </defs>
        {MARK_STROKES.map((s) => (
          <path key={s.d} className="jsi-st" d={s.d} data-delay={s.delay} data-opacity={s.opacity} />
        ))}
      </svg>
      <div className="jsi-count" aria-hidden="true">
        000
      </div>
      <div className="jsi-stage">
        <div className="jsi-lock">
          <div className="jsi-wm" aria-hidden="true">
            <span className="jsi-gold jsi-j" style={goldLetters(WORDMARK_GLYPHS.j)}>
              <GlyphBox g={WORDMARK_GLYPHS.j} />
            </span>
            <span className="jsi-gold jsi-x jsi-avor" style={goldLetters(WORDMARK_GLYPHS.avor)}>
              <GlyphBox g={WORDMARK_GLYPHS.avor} />
            </span>
            {/* The space between the two words: only its width. */}
            <span className="jsi-x jsi-gap">
              <GlyphBox g={WORDMARK_GLYPHS.gap} />
            </span>
            <span className="jsi-gold jsi-s" style={goldLetters(WORDMARK_GLYPHS.s)}>
              <GlyphBox g={WORDMARK_GLYPHS.s} />
            </span>
            <span className="jsi-gold jsi-x jsi-ped" style={goldLetters(WORDMARK_GLYPHS.ped)}>
              <GlyphBox g={WORDMARK_GLYPHS.ped} />
            </span>
          </div>
          <div className="jsi-hold" aria-hidden="true">
            <GlyphBox g={HOLDING_GLYPHS}>
              <path d={HOLDING_GLYPHS.d} fill="currentColor" />
            </GlyphBox>
          </div>
        </div>
      </div>
    </div>
  );
}
