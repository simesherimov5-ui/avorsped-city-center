import { getLenis } from "@/lib/lenis";

// One lock for everything that covers the page (the pop-ups, the phone menu, the intro). `overflow: hidden` on <html> stops
// the wheel and the keyboard, but iOS Safari still scrolls the page behind with a finger, so touch moves that do not start
// on something that really scrolls are dropped as well. Counted, so two covers at once do not unlock each other.
let locks = 0;
let previousOverflow = "";

// Something inside the cover that scrolls by itself (a tall pop-up): a finger on it is let through.
const scrollsInside = (start: Element | null) => {
  for (let el = start; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    const overflowY = getComputedStyle(el).overflowY;
    if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) return true;
  }
  return false;
};

const holdPage = (e: TouchEvent) => {
  if (e.touches.length > 1) return; // pinching to zoom stays possible
  if (!scrollsInside(e.target instanceof Element ? e.target : null)) e.preventDefault();
};

/** Stops the page behind from scrolling. Returns the function that gives the scrolling back. */
export function lockScroll(): () => void {
  const html = document.documentElement;
  if (locks++ === 0) {
    previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    document.addEventListener("touchmove", holdPage, { passive: false });
    getLenis()?.stop();
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--locks > 0) return;
    html.style.overflow = previousOverflow;
    document.removeEventListener("touchmove", holdPage);
    getLenis()?.start();
  };
}
