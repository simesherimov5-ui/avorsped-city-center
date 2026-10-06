import type Lenis from "lenis";

// The one smooth-scroll instance, registered by <SmoothScroll />, so a pop-up can pause it while it is open
// and a button can scroll to a spot through it. `null` when smooth scrolling is off (reduced motion).
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};
export const getLenis = () => instance;
