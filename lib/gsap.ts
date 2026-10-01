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

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  try {
    CustomEase.create(PREMIUM_EASE, "0.77, 0, 0.175, 1");
  } catch {
    // Already registered (Fast Refresh remount) — safe to ignore.
  }
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, SplitText, CustomEase };
