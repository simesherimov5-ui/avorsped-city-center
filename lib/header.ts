/** The header's height when nothing says otherwise (the desktop value of --nav-h in app/globals.css). */
const FALLBACK = 90;

/** The number of pixels in a CSS length such as "90px" (the shared --nav-h); the fallback for anything else. */
export function parseNavHeight(value: string, fallback = FALLBACK): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * The header's current height in px, read from the shared --nav-h (app/globals.css: 64 on a phone, 72 from 640px, 90 from
 * 1024px), so a scroll that must clear the header does not carry a number of its own.
 */
export function navHeight(): number {
  if (typeof document === "undefined") return FALLBACK;
  return parseNavHeight(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"));
}
