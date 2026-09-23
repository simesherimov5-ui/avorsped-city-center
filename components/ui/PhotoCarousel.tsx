"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/cn";

export function PhotoCarousel({ photos }: { photos: { src: string; alt: string }[] }) {
  const [[index, direction], setIndex] = useState<[number, number]>([0, 0]);

  const go = (dir: 1 | -1) => setIndex(([i]) => [(i + dir + photos.length) % photos.length, dir]);
  const goTo = (i: number) => setIndex(([current]) => [i, i > current ? 1 : -1]);

  return (
    <div className="bg-charcoal">
      <div className="mx-auto flex max-w-4xl items-center gap-2 px-2 py-8 sm:gap-4 sm:px-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Претходна слика"
          className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center text-warm-white/60 transition-colors hover:text-warm-white"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>

        <div className="relative aspect-[16/9] flex-1 overflow-hidden">
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
                sizes="(max-width: 1024px) 100vw, 900px"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Следна слика"
          className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center text-warm-white/60 transition-colors hover:text-warm-white"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      </div>
      <div className="flex justify-center gap-2 pb-8">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Слика ${i + 1}`}
            className={cn("h-1.5 w-6 rounded-full transition-colors", i === index ? "bg-accent" : "bg-warm-white/20")}
          />
        ))}
      </div>
    </div>
  );
}
