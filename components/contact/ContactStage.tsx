"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { usePageReady } from "@/components/page-transition/PageTransition";

/**
 * Plays the page's opening: the eyebrow, the headline (masked line reveal), the lead, then the form's steps and
 * the direct panel fade up in sequence. It waits for the curtain to clear. With reduced motion everything is
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
      const lead = q("lead");
      const panel = q("panel");
      const steps = [...el.querySelectorAll<HTMLElement>('[data-seq="step"]')];
      if (!eyebrow || !h1 || !lead || !panel) return;

      gsap.set([eyebrow, lead, panel, ...steps], { y: 24 });
      const tl = gsap.timeline({ paused: true });
      let split: SplitText | undefined;
      let cancelled = false;
      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
      (fonts ? fonts.ready : Promise.resolve()).then(() => {
        if (cancelled) return;
        split = new SplitText(h1, { type: "lines", mask: "lines", linesClass: "ct-line" });
        gsap.set(split.lines, { yPercent: 115 });
        gsap.set(h1, { opacity: 1 });
        tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0)
          .to(split.lines, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power4.out" }, 0.2)
          .to(lead, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.9)
          .to(
            steps,
            { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", clearProps: "transform" },
            1.1
          )
          .to(panel, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", clearProps: "transform" }, 1.3);
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
