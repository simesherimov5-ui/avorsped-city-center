"use client";

import type { MouseEvent, ReactNode } from "react";
import { getLenis } from "@/lib/lenis";

/**
 * A link down to a section of the same page (`target` is its id): a smooth scroll through the page's scroller, at once
 * with reduced motion. Without scripts it is a plain anchor.
 */
export function ScrollToLink({
  target,
  className,
  children,
}: {
  target: string;
  className?: string;
  children: ReactNode;
}) {
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(target);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { duration: reduce ? 0 : 1.1, immediate: reduce });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <a href={`#${target}`} onClick={go} className={className}>
      {children}
    </a>
  );
}
