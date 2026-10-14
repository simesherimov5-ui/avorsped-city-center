"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * GSAP ScrollTrigger fade+slide reveal, homepage-only — the site's other
 * pages keep using the existing Framer-Motion `components/ui/Reveal.tsx`
 * (same name, different folder: this one is GSAP, that one Framer).
 */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (prefersReducedMotion()) {
        gsap.set(ref.current, { opacity: 1, y: 0 });
        return;
      }

      // Lighter on phones: shorter travel, shorter duration.
      const phone = window.innerWidth < 768;
      gsap.set(ref.current, { opacity: 0, y: phone ? 20 : 40 });
      gsap.to(ref.current, {
        opacity: 1,
        y: 0,
        duration: phone ? 0.6 : 1,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: ref, dependencies: [delay] }
  );

  return <div ref={ref}>{children}</div>;
}
