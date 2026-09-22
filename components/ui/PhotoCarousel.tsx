"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/cn";

export function PhotoCarousel({ photos }: { photos: { src: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  return (
    <div className="bg-charcoal">
      <div className="mx-auto flex max-w-4xl items-center gap-2 px-2 py-8 sm:gap-4 sm:px-4">
        <button
          type="button"
          onClick={prev}
          aria-label="Претходна слика"
          className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center text-warm-white/60 transition-colors hover:text-warm-white"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
        <Media
          image={{ ...photos[index], isPlaceholder: false }}
          className="aspect-[16/9] flex-1"
          sizes="(max-width: 1024px) 100vw, 900px"
        />
        <button
          type="button"
          onClick={next}
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
            onClick={() => setIndex(i)}
            aria-label={`Слика ${i + 1}`}
            className={cn("h-1.5 w-6 rounded-full transition-colors", i === index ? "bg-accent" : "bg-warm-white/20")}
          />
        ))}
      </div>
    </div>
  );
}
