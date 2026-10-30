"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/Button";
import { CALM_EASE, gsap, prefersReducedMotion, ScrollTrigger, SplitText } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";

/** The band comes in once, when this share of it is on the screen. */
const IN_VIEW = 0.35;

/**
 * The inside of «Закажете средба»: a hairline, the eyebrow, the heading, one line of text and the two buttons. The server
 * HTML holds all of it, so the band is never empty if the script does not run. Once, when 35% of it is on the screen,
 * the hairline draws out from its centre, the eyebrow fades up, the heading rises line by line (each line clipped), then
 * the text and the two buttons fade up 0.15s apart; about 1.9s in all. Reduced motion: everything is there at once.
 * `scrollTarget` is the id of the section the secondary button scrolls to (without it there is no secondary button).
 */
export function BookBand({
  eyebrow,
  title,
  text,
  primaryHref,
  scrollTarget,
}: {
  eyebrow: string;
  title: string;
  text: string;
  primaryHref: string;
  scrollTarget?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const copy = useRef<HTMLParagraphElement>(null);
  const actions = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const band = root.current;
      const h2 = heading.current;
      if (!band || !h2 || prefersReducedMotion()) return;
      const buttons = actions.current ? Array.from(actions.current.children) : [];
      let split: SplitText | undefined;
      let trigger: ScrollTrigger | undefined;
      let cancelled = false;
      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
      (fonts ? fonts.ready : Promise.resolve()).then(() => {
        if (cancelled) return;
        split = new SplitText(h2, { type: "lines", mask: "lines", linesClass: "reveal-line" });
        const fade = [eyebrowRef.current, copy.current, ...buttons];
        gsap.set(line.current, { scaleX: 0, transformOrigin: "50% 50%" });
        gsap.set(fade, { autoAlpha: 0, y: 12 });
        gsap.set(split.lines, { yPercent: 100 });
        const tl = gsap.timeline({ paused: true, defaults: { ease: CALM_EASE } });
        tl.to(line.current, { scaleX: 1, duration: 0.9 }, 0)
          .to(eyebrowRef.current, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.2)
          .to(split.lines, { yPercent: 0, duration: 1, stagger: 0.12 }, 0.3)
          .to(copy.current, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.85)
          .to(buttons, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.15 }, 1);
        trigger = ScrollTrigger.create({
          trigger: band,
          start: () => `top ${window.innerHeight - band.offsetHeight * IN_VIEW}px`,
          once: true,
          onEnter: () => void tl.play(),
        });
      });
      return () => {
        cancelled = true;
        trigger?.kill();
        split?.revert();
      };
    },
    { scope: root }
  );

  const scrollToTarget = () => {
    const el = scrollTarget ? document.getElementById(scrollTarget) : null;
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -72 });
    else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  };

  return (
    <div ref={root} className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
      <div className="flex min-w-0 flex-col gap-4">
        <span ref={line} aria-hidden className="block h-px w-16 bg-gold" />
        <div ref={eyebrowRef} className="eyebrow text-gold">
          {eyebrow}
        </div>
        <h2
          ref={heading}
          className="m-0 max-w-[16ch] text-balance font-display text-(length:--fs-h2) font-normal leading-[1.2]"
        >
          {title}
        </h2>
        <p ref={copy} className="m-0 max-w-[62ch] text-base leading-[1.8] text-ink/80">
          {text}
        </p>
      </div>
      <div
        ref={actions}
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:shrink-0 lg:flex-nowrap lg:justify-end"
      >
        <Button href={primaryHref} variant="primary" tone="dark" className="w-full sm:w-auto">
          ЗАКАЖЕТЕ КОНСУЛТАЦИЈА
        </Button>
        {scrollTarget && (
          <Button
            variant="secondary"
            tone="dark"
            arrow
            onClick={scrollToTarget}
            // only the primary button is gold; this one rests in Травертин and keeps its own hover
            className="w-full sm:w-auto [&:not(:hover)]:border-travertine/40! [&:not(:hover)]:text-travertine!"
          >
            Разгледајте станови
          </Button>
        )}
      </div>
    </div>
  );
}
