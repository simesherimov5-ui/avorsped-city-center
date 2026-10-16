"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { CALM_EASE, DUR, gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { usePageReady } from "@/components/page-transition/PageTransition";

/**
 * Plays the page's opening: the eyebrow and the headline (masked line reveal), and with them the form and the direct
 * panel, which come in quickly (--dur-base) so the first question's options are all there within about half a second. It waits for the curtain to clear. With reduced motion everything is
 * simply there.
 */
export function ContactStage({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const ready = usePageReady();

  useGSAP(
    () => {
      const el = root.current;
      if (!ready || !el || prefersReducedMotion()) return;
      const q = (name: string) => el.querySelector<HTMLElement>(`[data-seq="${name}"]`);
      const eyebrow = q("eyebrow");
      const h1 = q("h1");
      const panel = q("panel");
      const steps = [...el.querySelectorAll<HTMLElement>('[data-seq="step"]')];
      if (!eyebrow || !h1 || !panel) return;

      gsap.set(eyebrow, { y: 24 });
      gsap.set([panel, ...steps], { y: 8 });
      const tl = gsap.timeline({ paused: true });
      let split: SplitText | undefined;
      let cancelled = false;
      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
      (fonts ? fonts.ready : Promise.resolve()).then(() => {
        if (cancelled) return;
        split = new SplitText(h1, { type: "lines", mask: "lines", linesClass: "ct-line" });
        gsap.set(split.lines, { yPercent: 115 });
        gsap.set(h1, { opacity: 1 });
        tl.to(eyebrow, { opacity: 1, y: 0, duration: DUR.slow, ease: CALM_EASE }, 0)
          .to(split.lines, { yPercent: 0, duration: DUR.slow, stagger: 0.05, ease: CALM_EASE }, 0.05)
          .to(
            steps,
            { opacity: 1, y: 0, duration: DUR.base, stagger: 0.05, ease: CALM_EASE, clearProps: "transform" },
            0.1
          )
          .to(panel, { opacity: 1, y: 0, duration: DUR.base, ease: CALM_EASE, clearProps: "transform" }, 0.15);
        tl.play();
      });

      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: root, dependencies: [ready] }
  );

  return <div ref={root}>{children}</div>;
}
