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
    <div className="relative aspect-[16/9] overflow-hidden">
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
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Претходна слика"
        className="focus-ring absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-charcoal/50 text-warm-white transition-colors hover:bg-charcoal/80"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Следна слика"
        className="focus-ring absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-charcoal/50 text-warm-white transition-colors hover:bg-charcoal/80"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Слика ${i + 1}`}
            className={cn("h-1.5 w-6 rounded-full transition-colors", i === index ? "bg-accent" : "bg-warm-white/50")}
          />
        ))}
      </div>
    </div>
  );
}
