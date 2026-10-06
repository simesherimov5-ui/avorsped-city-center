"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/** A 2px gold line fixed at the very top of the screen that fills as the page is read (scaleX tied to scroll). */
export function ReadingProgress() {
  const line = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!line.current || prefersReducedMotion()) return;
    gsap.to(line.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.3 },
    });
  });

  return <div ref={line} aria-hidden className="ab-progress" />;
}
