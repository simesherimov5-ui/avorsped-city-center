"use client";

import { useEffect, useRef } from "react";

/**
 * The footer wordmark. Its metallic sheen sweeps across once, when the footer comes into view, and then stays still
 * (see .footer-sheen in globals.css). Without scripts, or with reduced motion, it is simply the still wordmark.
 */
export function FooterSheen({ children }: { children: string }) {
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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="footer-sheen">
      {children}
    </div>
  );
}
