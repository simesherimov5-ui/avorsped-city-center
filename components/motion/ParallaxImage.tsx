"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/**
 * Wraps an image for two effects, layered on separate nested elements so
 * they never fight over the same property: a one-time clip-path wipe as it
 * enters the viewport (on the outer wrapper), and a continuous, oversized
 * scroll-scrubbed parallax (on the inner layer, taller than its clipping
 * parent and offset up, so the scrub never exposes an empty edge). The
 * immediate parent must be `overflow-hidden`.
 */
export function ParallaxImage({ children, className }: { children: ReactNode; className?: string }) {
  const clipRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!clipRef.current || !parallaxRef.current) return;
      if (prefersReducedMotion()) {
        gsap.set(clipRef.current, { clipPath: "inset(0 0 0 0)" });
        return;
      }

      gsap.set(clipRef.current, { clipPath: "inset(100% 0 0 0)" });
      gsap.to(clipRef.current, {
        clipPath: "inset(0% 0 0 0)",
        duration: window.innerWidth < 768 ? 0.7 : 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: clipRef.current, start: "top 90%", once: true },
      });

      // Parallax is for pointer devices with room for it — phones get the wipe only.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.fromTo(
          parallaxRef.current,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: clipRef.current?.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: clipRef }
  );

  return (
    <div ref={clipRef} className="absolute inset-0">
      <div ref={parallaxRef} className={cn("absolute inset-x-0 -top-[10%] h-[120%]", className)}>
        {children}
      </div>
    </div>
  );
}
