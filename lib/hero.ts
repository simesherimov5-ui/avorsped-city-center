/**
 * The width from which the text of a full-width photo hero (the Проекти slideshow, a project's opening) lies on the
 * photo; at this width and under, the photo is at the top and the text below it on Оникс. One value for both heroes:
 * the CSS block marked "hero breakpoint" in app/globals.css has to say the same (lib/hero.test.ts checks it).
 */
export const HERO_OVERLAY_MIN_WIDTH = 1101;
export const HERO_OVERLAY_QUERY = `(min-width: ${HERO_OVERLAY_MIN_WIDTH}px)`;

/**
 * The pages whose first screen is a full photo that the header floats over (clear until the page scrolls): Почетна,
 * Проекти and every photo-led («diptych») project page. A plain list, so the header does not have to load the project
 * data; lib/hero.test.ts checks that every diptych project is in it.
 */
export const HERO_UNDER_HEADER_PATHS = ["/", "/projects", "/projects/radovish-twins"];
