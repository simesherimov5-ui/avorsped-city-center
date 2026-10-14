"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { ResidentQuote } from "@/types";

const SHOW_MS = 7000;
const OUT_MS = 400;

/**
 * "Зборови на нашите станари": one resident's words at a time on Еспресо. It changes every 7s; the mouse or keyboard focus
 * inside the band, the band being off screen and a hidden tab all pause it, and a click on an indicator shows that quote
 * and starts the 7s again. The old words fade out and rise 8px, the new ones fade in from 8px below. The quote area
 * announces changes (aria-live) only once the visitor has used an indicator. Reduced motion: no automatic change.
 * With one quote there are no indicators and no timer; with none the band does not appear.
 */
export function Quotes({ quotes }: { quotes: ResidentQuote[] }) {
  const { t } = useI18n();
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [restart, setRestart] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [used, setUsed] = useState(false);
  const count = quotes.length;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => setOnScreen(entries.some((e) => e.isIntersecting)));
    observer.observe(el);
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count]);

  const paused = hovered || focused || !onScreen || tabHidden;

  // Every change goes through here: the old words leave (0.4s), then the new ones come in.
  const show = (next: number) => {
    setLeaving(true);
    window.setTimeout(
      () => {
        setIndex(next);
        setLeaving(false);
      },
      reduceMotion ? 0 : OUT_MS
    );
  };

  useEffect(() => {
    if (count < 2 || reduceMotion || paused) return;
    const timer = window.setTimeout(() => show((index + 1) % count), SHOW_MS);
    return () => window.clearTimeout(timer);
    // `show` only reads values listed here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, reduceMotion, paused, index, restart]);

  if (count === 0) return null;
  const quote = quotes[Math.min(index, count - 1)];
  const by = t("quotes.by").replace("{name}", quote.name).replace("{project}", quote.project);

  return (
    <section
      ref={root}
      aria-label={t("quotes.eyebrow")}
      className="bg-espresso text-on-chrome"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-9 px-5 py-20 text-center sm:px-8 md:py-[120px] lg:px-10">
        <div className="eyebrow text-accent" style={{ letterSpacing: "0.32em" }}>
          {t("quotes.eyebrow")}
        </div>
        <div
          aria-live={used ? "polite" : "off"}
          className="flex min-h-[200px] w-full max-w-[960px] flex-col items-center justify-center gap-9"
        >
          <div className={leaving ? "q-out" : "q-in"} key={`${index}-${leaving}`}>
            <blockquote className="m-0 font-display text-[clamp(30px,3.4vw,48px)] font-normal italic leading-[1.3] text-paper">
              „{quote.text}“
            </blockquote>
            <p className="mt-9 text-[10px] font-semibold uppercase tracking-[0.32em] text-accent">{by}</p>
          </div>
        </div>
        {count > 1 && (
          <div className="flex justify-center">
            {quotes.map((_, i) => {
              const active = i === index;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={t("quotes.indicator").replace("{n}", String(i + 1))}
                  aria-current={active}
                  onClick={() => {
                    setUsed(true);
                    setRestart((n) => n + 1);
                    if (i !== index) show(i);
                  }}
                  className="focus-ring flex h-11 w-11 items-center justify-center"
                >
                  <span
                    className={`block h-0.5 transition-[width,background-color] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      active ? "w-9 bg-accent" : "w-3.5 bg-on-chrome/20"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
