"use client";

import { useEffect } from "react";

/**
 * Dev-only QA aid: press "g" to toggle `filter: grayscale(1)` on <html>, to
 * check that hierarchy (the CTA, status indicators, headings) still reads
 * without color. Renders nothing in production.
 */
export function GrayscaleToggle() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "g" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      document.documentElement.style.filter =
        document.documentElement.style.filter === "grayscale(1)" ? "" : "grayscale(1)";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
