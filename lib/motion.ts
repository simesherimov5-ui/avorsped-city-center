// Shared motion tokens — one vocabulary of timing/easing/distance reused by
// every animated component instead of ad hoc numbers per file. Values tuned
// for a "calm, architectural, confident" feel: quick enough to never make a
// visitor wait, restrained enough to never call attention to itself.

/** Standard ease-out curve — the site's one signature easing. */
export const EASE = [0.22, 1, 0.36, 1] as const;

// The three speeds and the easing are the CSS variables --dur-fast / --dur-base / --dur-slow and --ease in
// app/globals.css; these are the same values in seconds for Framer Motion and GSAP.
export const DURATION = {
  /** State feedback: hover highlight, focus ring, small color shifts (--dur-fast). Nothing on the site is faster. */
  instant: 0.16,
  /** Selection changes, panel content swaps (--dur-fast). */
  fast: 0.16,
  /** Menus, pop-ups, form steps, toggles (--dur-base). */
  base: 0.28,
  /** Section reveals, image movement (--dur-slow). */
  slow: 0.6,
  /** Page-load entrance sequences, hero settle-in. */
  entrance: 0.8,
  /** Zoom-transition "expand to cover" phase between route levels (masterplan→building→floor→apartment). */
  zoomExpand: 0.62,
  /** Zoom-transition "reveal" phase once the destination page has mounted. */
  zoomReveal: 0.46,
} as const;

/** Delay step between staggered siblings (cards, list rows). */
export const STAGGER = 0.05;

/** Default vertical travel (px) for a scroll/entrance reveal. */
export const REVEAL_DISTANCE = 24;

/** What leaves takes about 75% of the time it took to arrive (never under DURATION.fast). */
export const exitDuration = (d: number) => Math.max(DURATION.fast, d * 0.75);

/** Scroll reveals start as soon as a little of the element is inside the bottom 90% of the screen. */
export const REVEAL_VIEWPORT = { once: true, margin: "0px 0px -10% 0px", amount: 0.05 } as const;

/** The same point for GSAP ScrollTrigger: the element's top passes 92% of the screen's height. */
export const REVEAL_START = "top 92%";
