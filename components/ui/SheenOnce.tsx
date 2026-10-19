"use client";

import { useEffect, useRef } from "react";

/**
 * A wordmark with the metallic sheen (the footer's, the Проекти hero's). The sheen sweeps across once (2.4s), when the
 * wordmark comes into view, and then stays still: the element gets "is-on" (see .footer-sheen in globals.css and
 * .pj-sheen in projects.css). Without scripts, or with reduced motion, it is simply the still wordmark.
 */
export function SheenOnce({ children, className = "footer-sheen" }: { children: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        el.classList.add("is-on");
        io.disconnect();
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
