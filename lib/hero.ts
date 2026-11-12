import type { BoxFrame } from "@/lib/image-sizes";

/**
 * The width from which the text of a full-width photo hero (the Проекти slideshow, a project's opening) lies on the
 * photo; at this width and under, the photo is at the top and the text below it on Оникс. One value for both heroes:
 * the CSS block marked "hero breakpoint" in app/globals.css has to say the same (lib/hero.test.ts checks it).
 */
export const HERO_OVERLAY_MIN_WIDTH = 1101;
export const HERO_OVERLAY_QUERY = `(min-width: ${HERO_OVERLAY_MIN_WIDTH}px)`;

/**
 * The screen shape (width ÷ height) from which a photo-led opening is the whole first screen, its photo framed on Оникс
 * between the back link and the text; narrower than this, the photo is full width under the header and the text below
 * it. A landscape phone (844 × 390) is wide, a portrait tablet (1024 × 1366) is not. The CSS block marked "opening
 * shape" in app/globals.css has to say the same (lib/hero.test.ts checks it). City Center's opening still switches at
 * HERO_OVERLAY_MIN_WIDTH.
 */
export const OPENING_WIDE_MIN_RATIO = 1.3;
export const OPENING_WIDE_QUERY = `(min-aspect-ratio: ${Math.round(OPENING_WIDE_MIN_RATIO * 100)}/100)`;

/** The header's height from each width up, widest first (--nav-h in app/globals.css; lib/hero.test.ts checks it). */
export const NAV_HEIGHTS: readonly (readonly [minWidth: number, height: number])[] = [
  [1024, 90],
  [640, 72],
  [0, 64],
];

/**
 * The layouts of a photo under the clear header on a wide screen, for boxSizes: one per header height, the frame the
 * full width and `h` high, its building box kept 16px under the header (--photo-top in app/globals.css) and above
 * `bottom` (--photo-bottom) when the frame can be taller than the screen.
 */
export const wideBoxFrames = (h: string, bottom?: string): BoxFrame[] =>
  NAV_HEIGHTS.map(([min, nav]) => ({
    media: `${OPENING_WIDE_QUERY}${min ? ` and (min-width: ${min}px)` : ""}`,
    w: "100vw",
    h,
    top: `${nav + 16}px`,
    ...(bottom && { bottom }),
  }));

/**
 * The pages whose first screen the header floats over (clear until the page scrolls): the full photo of Почетна and
 * Проекти, and the Оникс opening of every photo-led project page. A plain list, so the header does not have to load the project data;
 * lib/hero.test.ts checks that every photo-led project is in it.
 */
export const HERO_UNDER_HEADER_PATHS = ["/", "/projects", "/projects/radovish-twins"];
