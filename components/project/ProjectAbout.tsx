"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import type { ProjectAbout as ProjectAboutData } from "@/types";

/**
 * "За проектот": the idea of the project, two columns on the cream page (one on phones). The heading, then the
 * paragraphs and a signature. When the section comes into view the left column rises 24px (1s) and the right one 0.15s
 * later; reduced motion: no movement.
 */
export function ProjectAbout({ about, id = "za-proektot" }: { about: ProjectAboutData; id?: string }) {
  const { locale } = useI18n();
  const root = useRef<HTMLElement>(null);
  const head = locale === "en" && about.en ? about.en : about;

  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const columns = el.querySelectorAll<HTMLElement>(".about-col");
    // Already on screen when the page opened: nothing to play.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.7) return;
    columns.forEach((c) => (c.dataset.armed = "true"));
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        columns.forEach((c) => (c.dataset.armed = "false"));
        observer.disconnect();
      },
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={root} id={id}>
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-start gap-16 px-[5%] pb-20 pt-24 md:pb-[120px] md:pt-[140px]">
        <div className="about-col flex flex-[1_1_360px] flex-col gap-[22px]">
          <div className="eyebrow text-gold-deep">{head.kicker}</div>
          <h2 className="font-display text-[clamp(38px,4.4vw,62px)] font-normal leading-[1.05] text-ink">
            {head.title}
            {head.titleItalic}
          </h2>
        </div>
        <div
          className="about-col flex flex-[1_1_440px] flex-col gap-[22px] text-base font-light leading-[1.8] text-ink/80 md:pt-[34px]"
          style={{ "--about-delay": "0.15s" } as React.CSSProperties}
        >
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="m-0 max-w-[62ch]">
              {paragraph}
            </p>
          ))}
          <div aria-hidden className="mt-2.5 h-px w-full max-w-[62ch] bg-line" />
          <div className="font-display text-xl italic text-gold-deep">{about.signature}</div>
        </div>
      </div>
    </section>
  );
}
