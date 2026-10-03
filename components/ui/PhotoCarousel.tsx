"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/cn";
import type { ImageFocus } from "@/types";

export function PhotoCarousel({
  photos,
  className,
  fit,
  focus,
  sizes = "(max-width: 672px) 100vw, 672px",
}: {
  photos: { src: string; alt: string }[];
  className?: string;
  fit?: "cover" | "contain";
  /** The project's framing of its photos (see ImageFocus). */
  focus?: ImageFocus;
  /** The width the carousel is really shown at; the default matches its default max-w-2xl (672px). */
  sizes?: string;
}) {
  const [[index, direction], setIndex] = useState<[number, number]>([0, 0]);

  const go = (dir: 1 | -1) => setIndex(([i]) => [(i + dir + photos.length) % photos.length, dir]);
  const goTo = (i: number) => setIndex(([current]) => [i, i > current ? 1 : -1]);

  return (
    <div className={cn("relative mx-auto aspect-[16/9] overflow-hidden", className ?? "max-w-2xl")}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          initial={{ opacity: 0, x: direction >= 0 ? 48 : -48 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction >= 0 ? -48 : 48 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Media
            image={{ ...photos[index], isPlaceholder: false }}
            className="h-full w-full"
            sizes={sizes}
            priority={index === 0}
            fit={fit}
            // a carousel mixes photos of different shapes, so only the project's one-photo framing is not applied here
            focus={fit === "contain" ? undefined : focus}
          />
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Претходна слика"
        className="focus-ring absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-chrome/50 text-on-chrome transition-colors hover:bg-chrome/80"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Следна слика"
        className="focus-ring absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-chrome/50 text-on-chrome transition-colors hover:bg-chrome/80"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Слика ${i + 1}`}
            className="focus-ring flex h-11 w-11 items-center justify-center"
          >
            <span
              className={cn(
                "block h-1.5 w-6 rounded-full transition-colors",
                i === index ? "bg-accent" : "bg-on-chrome/50"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
