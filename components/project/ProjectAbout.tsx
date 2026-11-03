"use client";

import { Fragment, useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { BuildingMark } from "@/components/ui/Logo";
import { getLenis } from "@/lib/lenis";
import { useI18n } from "@/lib/i18n";
import type { ProjectAbout as ProjectAboutData } from "@/types";

/** Section progress (0 = its top at the bottom of the screen, 1 = its bottom at the top) at which keyword n lights. */
const keywordAt = (n: number) => 0.35 + n * 0.15;

/**
 * The paragraph with its accent phrases (each set once, where it first appears) in Cormorant Garamond and a little
 * larger. They start in the paragraph's colour and turn gold with an underline as the section scrolls by (`data-lit`).
 */
function withAccents(text: string, accents: string[]): ReactNode[] {
  const marks = accents
    .map((phrase) => ({ phrase, at: text.indexOf(phrase) }))
    .filter((m) => m.at >= 0)
    .sort((a, b) => a.at - b.at);
  const parts: ReactNode[] = [];
  let from = 0;
  for (const { phrase, at } of marks) {
    if (at < from) continue;
    parts.push(text.slice(from, at));
    parts.push(
      <span key={at} data-keyword className="pa-key font-display text-[1.15em]">
        {phrase}
      </span>
    );
    from = at + phrase.length;
  }
  parts.push(text.slice(from));
  return parts;
}

/**
 * "За проектот", right after the opening: a dark band (Еспресо) with the logo mark faint in its middle under a soft
 * darkening, and one centred column: a short gold line, the headline (one line), the line under it, the paragraphs with
 * their keywords, and the way down to the building picker (`target`, smooth; at once with reduced motion). Upright
 * everywhere (no italic on the site).
 *
 * Motion (app/globals.css, .pa-intro): when about a quarter of the section is on screen the headline fades in (from
 * 768px its letter spacing settles from .12em; under it it rises 16px like the rest), then the line under it, the
 * paragraphs and the link rise one after another; as the section scrolls by, its keywords turn gold one by one and stay
 * so. The hidden start is set by this script only while all those lines are below the screen: landing on them or past
 * them, and with reduced motion, everything is shown and every keyword is lit.
 */
export function ProjectAbout({
  about,
  id = "za-proektot",
  target,
}: {
  about: ProjectAboutData;
  id?: string;
  /** The id of the section «ИЗБЕРЕТЕ ЗГРАДА ↓» leads to; without it there is no link. */
  target?: string;
}) {
  const { locale } = useI18n();
  const head = locale === "en" && about.en ? about.en : about;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const keywords = [...el.querySelectorAll<HTMLElement>("[data-keyword]")];
    let lit = 0;
    const light = (n: number) => {
      for (; lit < n; lit++) keywords[lit].dataset.lit = "true";
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Armed only while every line it would hide is still below the screen (the band's top and its gold line may already
    // show, as on a phone under the opening). Landing on the text or past it (a reload, a link to it), or with reduced
    // motion: the final state at once, keywords lit without fading.
    const firstLine = el.querySelector(".pa-headline, .pa-reveal");
    if (reduce || !firstLine || firstLine.getBoundingClientRect().top < window.innerHeight) {
      el.dataset.state = "static";
      light(keywords.length);
      return;
    }
    el.dataset.state = "armed";
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      const screen = window.innerHeight;
      const onScreen = Math.min(box.bottom, screen) - Math.max(box.top, 0);
      if (box.bottom < 0) {
        // flicked past it: everything shown, every keyword lit
        el.dataset.state = "shown";
        light(keywords.length);
      } else if (el.dataset.state === "armed" && onScreen >= 0.25 * Math.min(box.height, screen)) {
        el.dataset.state = "shown";
      }
      const progress = (screen - box.top) / (screen + box.height);
      let n = lit;
      while (n < keywords.length && progress >= keywordAt(n)) n++;
      light(n);
      if (el.dataset.state === "shown" && lit === keywords.length) stop();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const stop = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      stop();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const goDown = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = target ? document.getElementById(target) : null;
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { duration: reduce ? 0 : 1.1, immediate: reduce });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  // the lines after the headline come in one after another, 0.15s apart: the subtitle, each paragraph, the link
  const first = head.subtitle ? 1 : 0;
  const delay = (n: number) => ({ "--pa-delay": `${0.3 + 0.15 * n}s` }) as CSSProperties;

  return (
    <section ref={sectionRef} id={id} className="brand-voice pa-intro relative isolate overflow-hidden bg-espresso">
      <div aria-hidden className="pa-intro-mark">
        <BuildingMark className="text-on-chrome" style={{ height: 200, width: "auto", opacity: 0.06 }} />
      </div>
      <div className="pa-intro-scrim" aria-hidden />
      <div className="relative mx-auto flex w-full max-w-[860px] flex-col items-center px-[5%] py-14 text-center md:py-24">
        <span aria-hidden className="block h-14 w-px bg-gold" />
        {head.title && (
          <h2 className="pa-headline m-0 mt-8 whitespace-nowrap font-display text-[clamp(30px,5.2vw,60px)] font-normal leading-[1.1] text-paper">
            {head.title}
          </h2>
        )}
        {head.subtitle && (
          <p
            className="pa-reveal m-0 mt-[14px] font-sans text-[12px] uppercase tracking-[0.32em] text-paper/64"
            style={delay(0)}
          >
            {head.subtitle}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-8">
          {about.paragraphs.map((paragraph, i) => (
            <p
              key={paragraph.slice(0, 24)}
              className="pa-reveal m-0 text-[17px] font-light leading-[1.9] text-paper/85 md:text-[19px]"
              style={delay(first + i)}
            >
              {withAccents(paragraph, about.accents ?? []).map((part, i) => (
                <Fragment key={i}>{part}</Fragment>
              ))}
            </p>
          ))}
        </div>
        {target && (
          <a
            href={`#${target}`}
            onClick={goDown}
            className="pa-reveal focus-ring mt-8 inline-flex min-h-11 items-center text-label font-semibold uppercase tracking-[0.3em] text-gold"
            style={delay(first + about.paragraphs.length)}
          >
            Изберете зграда ↓
          </a>
        )}
      </div>
    </section>
  );
}
