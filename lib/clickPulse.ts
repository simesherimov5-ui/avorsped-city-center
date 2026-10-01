import type { PointerEvent as ReactPointerEvent } from "react";

/**
 * The one click-feedback flourish used sitewide (buttons, nav links, cards):
 * a gold pulse expanding from the pointer's position. Plain DOM + CSS rather
 * than GSAP or Framer, since this fires on elements from both motion systems
 * (the GSAP homepage and the Framer-driven pages) and doesn't need either's
 * runtime — see lib/gsap.ts's own note on why those two stay scoped.
 *
 * The host element needs `position: relative` (and should NOT set
 * `overflow: hidden` itself) — the pulse is clipped by its own dedicated
 * `.click-pulse-overlay` sibling instead, so it never clips the host's real
 * content (badges, underlines) that's meant to bleed outside its bounds.
 */
export function spawnClickPulse(e: ReactPointerEvent<HTMLElement>) {
  if (e.button !== undefined && e.button !== 0) return;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const host = e.currentTarget;
  let overlay = host.querySelector<HTMLSpanElement>(":scope > .click-pulse-overlay");
  if (!overlay) {
    overlay = document.createElement("span");
    overlay.className = "click-pulse-overlay";
    host.prepend(overlay);
  }

  const rect = host.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.6;
  const pulse = document.createElement("span");
  pulse.className = "click-pulse";
  pulse.style.width = `${size}px`;
  pulse.style.height = `${size}px`;
  pulse.style.left = `${e.clientX - rect.left - size / 2}px`;
  pulse.style.top = `${e.clientY - rect.top - size / 2}px`;
  pulse.addEventListener("animationend", () => pulse.remove());
  overlay.appendChild(pulse);
}
