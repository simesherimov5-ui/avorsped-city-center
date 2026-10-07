// Shared GSAP setup — the GSAP-side counterpart to lib/motion.ts. Scoped to
// the preloader/hero-entrance/homepage-scroll feature; everywhere else on
// the site (page transitions, navbar, the other Reveal) stays on Framer
// Motion untouched. Plugins are registered once here rather than at each
// call site.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

/** The site's one signature curve for deliberate, unhurried motion. */
export const PREMIUM_EASE = "premium";

/** The calm settle curve (cubic-bezier .22, 1, .36, 1) the redesign uses for things that arrive: the opening's strokes and wordmark. */
export const CALM_EASE = "calm";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  for (const [name, curve] of [
    [PREMIUM_EASE, "0.77, 0, 0.175, 1"],
    [CALM_EASE, "0.22, 1, 0.36, 1"],
  ]) {
    try {
      CustomEase.create(name, curve);
    } catch {
      // Already registered (Fast Refresh remount) — safe to ignore.
    }
  }
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, SplitText, CustomEase };
