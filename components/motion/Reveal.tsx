"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * The one reveal of the site: content rises 24px and fades in over 0.9s (cubic-bezier(.22, 1, .36, 1)) once 15% of it is
 * on screen, and plays once. `delay` staggers siblings (0.08s apart). What is already on screen when the page opens is
 * left as it is; with reduced motion, or without scripts, everything is simply shown (see [data-reveal] in globals.css).
 * `immediate` plays at once in plain CSS (`.enter`) so the text of a page's top does not wait for the scripts.
 */
export function Reveal({
  children,
  delay = 0,
  immediate = false,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  immediate?: boolean;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || immediate) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = el.getBoundingClientRect();
    // Already on screen when the page opened (or the visitor jumped past it): nothing to play.
    if (box.top < window.innerHeight * 0.85) return;
    el.dataset.reveal = "armed";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        el.dataset.reveal = "in";
        observer.disconnect();
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate]);

  const style = { "--reveal-delay": `${delay}s`, "--enter-delay": `${delay}s` } as CSSProperties;
  return (
    <Tag
      ref={ref}
      className={[immediate ? "enter" : "", className].filter(Boolean).join(" ") || undefined}
      style={style}
    >
      {children}
    </Tag>
  );
}
