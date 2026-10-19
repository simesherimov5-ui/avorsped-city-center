"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCompare } from "@/lib/compare-context";
import { usePageTransition } from "@/components/page-transition/PageTransition";
import { Button } from "@/components/ui/Button";
import { getApartment, placeLabel } from "@/data";
import { X } from "lucide-react";

/** The bar slides up with a small spring (420ms) and leaves in 75% of that time. */
const SPRING_IN = { duration: 0.42, ease: [0.34, 1.4, 0.64, 1] as const };
const SLIDE_OUT = { duration: 0.42 * 0.75, ease: [0.22, 1, 0.36, 1] as const };

/**
 * The bar is shown only where people choose apartments: on one of these paths or under it. Any other page (the home
 * page, За нас, Контакт, the 404 page, a page added later) has no bar at all. A new project route is one line here.
 * `/compare` is listed so it keeps doing what it did before this list existed.
 */
export const COMPARE_BAR_PATHS = ["/projects", "/completed-projects", "/development", "/dojran", "/compare"];

export const showsCompareBar = (pathname: string) =>
  COMPARE_BAR_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export function CompareBar() {
  const { ids, toggle, clear } = useCompare();
  const pathname = usePathname();
  const transition = usePageTransition();
  const reduceMotion = useReducedMotion();

  // The page before this one. Coming from a page without the bar, its entrance waits until the curtain has started to
  // clear (the transition's target is this page until then), so it comes in once, in view, instead of finishing unseen
  // behind the curtain.
  const [paths, setPaths] = useState({ current: pathname, previous: pathname });
  if (paths.current !== pathname) setPaths({ current: pathname, previous: paths.current });
  const cameFromPageWithoutBar = !showsCompareBar(paths.previous);

  // The selection itself is never touched here: it stays in localStorage while the bar is not shown. With nothing
  // selected there is no bar at all; "Исчисти" empties the selection and the bar slides away.
  const visible =
    showsCompareBar(pathname) && ids.length > 0 && !(cameFromPageWithoutBar && transition?.target === pathname);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="compare-bar"
          data-compare-bar
          role="region"
          aria-label="Споредба"
          initial={reduceMotion ? false : { y: "calc(100% + 18px)", opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: reduceMotion ? { duration: 0 } : SPRING_IN }}
          exit={
            reduceMotion
              ? { opacity: 0, transition: { duration: 0 } }
              : { y: "calc(100% + 18px)", opacity: 0, transition: SLIDE_OUT }
          }
          className="fixed inset-x-0 bottom-[18px] z-40 mx-auto w-[min(520px,calc(100%-32px))] border border-line bg-warm-white px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              <span className="eyebrow shrink-0 text-muted">Споредба ({ids.length}/3)</span>
              {ids.map((id) => {
                const apt = getApartment(id);
                if (!apt) return null;
                return (
                  <span
                    key={id}
                    className="flex shrink-0 items-center gap-1.5 border border-line bg-cream px-3 py-1.5 text-xs"
                  >
                    <span>
                      Стан {apt.number}
                      <span className="ml-1.5 text-muted">{placeLabel(apt).text}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      aria-label={`Отстрани стан ${apt.number}`}
                      className="focus-ring -my-1 -mr-1.5 inline-flex h-6 w-6 items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="tertiary" size="sm" onClick={clear}>
                Исчисти
              </Button>
              <Button href={`/compare?ids=${encodeURIComponent(ids.join(","))}`} variant="primary" size="sm">
                Спореди
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
