/**
 * The width from which the text of a full-width photo hero (the Проекти slideshow, a project's opening) lies on the
 * photo; at this width and under, the photo is at the top and the text below it on Оникс. One value for both heroes:
 * the CSS block marked "hero breakpoint" in app/globals.css has to say the same (lib/hero.test.ts checks it), and the
 * film of a project's opening plays from here up.
 */
export const HERO_OVERLAY_MIN_WIDTH = 1101;
export const HERO_OVERLAY_QUERY = `(min-width: ${HERO_OVERLAY_MIN_WIDTH}px)`;
