"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCompare } from "@/lib/compare-context";
import { usePageTransition } from "@/components/page-transition/PageTransition";
import { Button } from "@/components/ui/Button";
import { getApartment } from "@/data";
import { X } from "lucide-react";

/**
 * The bar is shown only where people choose apartments: on one of these paths or under it. Any other page (the home
 * page, За нас, Контакт, the 404 page, a page added later) has no bar at all. A new project route is one line here.
 * `/compare` is listed so it keeps doing what it did before this list existed.
 */
export const COMPARE_BAR_PATHS = [
  "/apartments",
  "/projects",
  "/completed-projects",
  "/development",
  "/dojran",
  "/compare",
];

export const showsCompareBar = (pathname: string) =>
  COMPARE_BAR_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export function CompareBar() {
  const { ids, toggle, clear } = useCompare();
  const pathname = usePathname();
  const transition = usePageTransition();

  // The page before this one. Coming from a page without the bar, its entrance waits until the curtain has started to
  // clear (the transition's target is this page until then), so it comes in once, in view, instead of finishing unseen
  // behind the curtain.
  const [paths, setPaths] = useState({ current: pathname, previous: pathname });
  if (paths.current !== pathname) setPaths({ current: pathname, previous: paths.current });
  const cameFromPageWithoutBar = !showsCompareBar(paths.previous);

  // The selection itself is never touched here: it stays in localStorage while the bar is not shown.
  if (!showsCompareBar(pathname) || ids.length === 0 || (cameFromPageWithoutBar && transition?.target === pathname))
    return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-warm-white/95 backdrop-blur px-4 py-3 sm:px-8"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
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
                  Стан {apt.number}
                  <button onClick={() => toggle(id)} aria-label={`Отстрани стан ${apt.number}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clear} className="!px-3">
              Исчисти
            </Button>
            <Button href={`/compare?ids=${encodeURIComponent(ids.join(","))}`} variant="primary" size="sm">
              Спореди
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
