// Shared motion tokens — one vocabulary of timing/easing/distance reused by
// every animated component instead of ad hoc numbers per file. Values tuned
// for a "calm, architectural, confident" feel: quick enough to never make a
// visitor wait, restrained enough to never call attention to itself.

/** Standard ease-out curve — the site's one signature easing. */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  /** State feedback: hover highlight, focus ring, small color shifts. */
  instant: 0.12,
  /** Selection changes, panel content swaps. */
  fast: 0.18,
  /** Panel/sheet mount, dropdown/tooltip appearance. */
  base: 0.3,
  /** Section reveals, larger panel transitions. */
  slow: 0.5,
  /** Page-load entrance sequences, hero settle-in. */
  entrance: 0.8,
  /** Zoom-transition "expand to cover" phase between route levels (masterplan→building→floor→apartment). */
  zoomExpand: 0.62,
  /** Zoom-transition "reveal" phase once the destination page has mounted. */
  zoomReveal: 0.46,
} as const;

/** Delay step between staggered siblings (cards, list rows). */
export const STAGGER = 0.07;

/** Default vertical travel (px) for a scroll/entrance reveal. */
export const REVEAL_DISTANCE = 24;
