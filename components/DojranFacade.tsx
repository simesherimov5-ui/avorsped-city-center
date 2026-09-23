"use client";

import { useState } from "react";
import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { dojranFloors } from "@/data/dojran";
import { cn } from "@/lib/cn";

// Horizontal bands over the facade photo, top to bottom, matching the
// building's visible floors (top floor first). Approximate — the photo
// has no markers, so these are calibrated by eye against the elevation.
const BANDS = [
  { number: 3, top: "19%", height: "21%" },
  { number: 2, top: "40%", height: "11%" },
  { number: 1, top: "51%", height: "12%" },
  { number: 0, top: "63%", height: "12%" },
];

export function DojranFacade({ image }: { image: { src: string; alt: string; isPlaceholder: boolean } }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative self-start">
      <Media image={image} label="Дојрански Рај — фасада" className="aspect-[16/8]" sizes="100vw" />
      {BANDS.map((band) => {
        const floor = dojranFloors.find((f) => f.number === band.number);
        if (!floor) return null;
        const isHovered = hovered === band.number;

        return (
          <Link
            key={band.number}
            href={`/dojran/${band.number}`}
            onMouseEnter={() => setHovered(band.number)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(band.number)}
            onBlur={() => setHovered(null)}
            aria-label={floor.label}
            className="focus-ring absolute inset-x-0 flex items-center justify-center"
            style={{ top: band.top, height: band.height }}
          >
            <div
              className={cn(
                "flex h-full w-full items-center justify-center border-2 transition-colors",
                isHovered ? "border-accent bg-accent/20" : "border-transparent"
              )}
            >
              <span
                className={cn(
                  "rounded-full bg-charcoal px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-warm-white shadow-md transition-opacity",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              >
                {floor.label}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
