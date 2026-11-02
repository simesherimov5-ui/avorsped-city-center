"use client";

import type { ReactNode } from "react";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/gsap";

/** A text link (the site's third level) that scrolls to the section with the id `target` on the same page, through the smooth scroll. */
export function ScrollToButton({ target, children }: { target: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className="btn-tertiary focus-ring"
      onClick={() => {
        const el = document.getElementById(target);
        if (!el) return;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(el, { offset: -72 });
        else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      }}
    >
      {children}
    </button>
  );
}
