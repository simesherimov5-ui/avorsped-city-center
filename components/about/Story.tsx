"use client";

import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

type Props = {
  eyebrow: string;
  /** The big statement. */
  statement: string;
  /** A phrase inside the statement to set in gold italic. */
  gold?: string;
  /** Smaller paragraphs under the statement. */
  more?: string[];
};

/** Words of `text` with a flag on the ones that belong to the `gold` phrase. */
function tokenize(text: string, gold?: string) {
  const words = text.split(" ");
  const goldWords = gold?.split(" ") ?? [];
  const start = goldWords.length ? words.findIndex((_, i) => goldWords.every((g, k) => words[i + k] === g)) : -1;
  return words.map((word, i) => ({ word, gold: start >= 0 && i >= start && i < start + goldWords.length }));
}

/**
 * One big centred statement. Word by word it brightens from 25% to 100% as it scrolls through the screen
 * (scrubbed to the scroll); with reduced motion it is simply shown.
 */
export function Story({ eyebrow, statement, gold, more = [] }: Props) {
  const text = useRef<HTMLParagraphElement>(null);
  const words = tokenize(statement, gold);

  useGSAP(
    () => {
      const el = text.current;
      if (!el || prefersReducedMotion()) return;
      const spans = el.querySelectorAll<HTMLElement>("[data-word]");
      gsap.set(spans, { opacity: 0.25 });
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true } })
        .to(spans, { opacity: 1, ease: "none", stagger: 0.25, duration: 0.5 });
    },
    { scope: text }
  );

  return (
    <section className="ab-story bk-wrap">
      <div className="ab-story-inner">
        <div className="bk-eyebrow is-center">{eyebrow}</div>
        <p ref={text} className="ab-story-text bk-serif">
          {words.map((w, i) => (
            <Fragment key={i}>
              <span data-word className={cn(w.gold && "bk-gold-i")}>
                {w.word}
              </span>{" "}
            </Fragment>
          ))}
        </p>
        {more.length > 0 && (
          <Reveal>
            <div className="ab-story-rest">
              {more.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
