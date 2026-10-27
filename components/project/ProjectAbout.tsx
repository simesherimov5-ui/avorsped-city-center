"use client";

import { Fragment, type MouseEvent, type ReactNode } from "react";
import { BuildingMark } from "@/components/ui/Logo";
import { getLenis } from "@/lib/lenis";
import { useI18n } from "@/lib/i18n";
import type { ProjectAbout as ProjectAboutData } from "@/types";

/** The paragraph with its accent phrases (each set once, where it first appears) in Playfair, gold and a little larger. */
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
      <span key={at} className="font-display text-[1.15em] text-gold">
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
 * darkening, and one centred column: the label, the heading with its gold end, a short gold line, the paragraphs with
 * their gold words, and the way down to the building picker (`target`, smooth; at once with reduced motion). Upright
 * everywhere (no italic on the site).
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

  const goDown = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = target ? document.getElementById(target) : null;
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { duration: reduce ? 0 : 1.1, immediate: reduce });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section
      id={id}
      className="pa-intro relative isolate overflow-hidden bg-espresso md:flex md:min-h-[820px] md:items-center"
    >
      <div aria-hidden className="pa-intro-mark">
        <BuildingMark className="text-on-chrome" style={{ height: 200, width: "auto", opacity: 0.06 }} />
      </div>
      <div className="pa-intro-scrim" aria-hidden />
      <div className="relative mx-auto flex w-full max-w-[860px] flex-col items-center gap-8 px-[5%] py-20 text-center md:py-[130px]">
        <div className="eyebrow tracking-[0.4em] text-gold">{head.kicker}</div>
        <h2 className="m-0 font-display text-[clamp(40px,4.8vw,66px)] font-normal leading-[1.05] text-paper">
          {head.title}
          <span className="text-gold">{head.titleItalic}</span>
        </h2>
        <span aria-hidden className="block h-14 w-px bg-gold" />
        {about.paragraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 24)}
            className="m-0 text-[17px] font-light leading-[1.9] text-paper/85 md:text-[19px]"
          >
            {withAccents(paragraph, about.accents ?? []).map((part, i) => (
              <Fragment key={i}>{part}</Fragment>
            ))}
          </p>
        ))}
        {target && (
          <a
            href={`#${target}`}
            onClick={goDown}
            className="focus-ring inline-flex min-h-11 items-center text-label font-semibold uppercase tracking-[0.3em] text-gold"
          >
            Изберете зграда ↓
          </a>
        )}
      </div>
    </section>
  );
}
