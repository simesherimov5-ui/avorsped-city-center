/** Routes drawn on the all-black theme. The navbar reads this too, so it matches the page it sits on. */
const BLACK_PAGES = ["/about", "/contact"];

export const isBlackPage = (path: string) => BLACK_PAGES.some((p) => path === p || path.startsWith(p + "/"));
