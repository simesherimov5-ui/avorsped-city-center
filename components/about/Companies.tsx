"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * The group's companies as one quiet, centred line (stacked on phones). The company this site belongs to comes
 * first and is gold. The names fade in one after another when the line scrolls into view.
 */
export function Companies({ eyebrow, companies }: { eyebrow: string; companies: string[] }) {
  const list = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const el = list.current;
      if (!el || prefersReducedMotion()) return;
      gsap.set(el.children, { opacity: 0 });
      gsap.to(el.children, {
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    },
    { scope: list }
  );

  return (
    <div style={{ textAlign: "center" }}>
      <div className="bk-eyebrow is-center">{eyebrow}</div>
      <ul ref={list} className="ab-inline">
        {companies.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}
