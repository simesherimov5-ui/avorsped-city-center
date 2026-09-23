"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/cn";

interface RoomVideo {
  label: string;
  video: string;
}

const ROOMS: Record<string, RoomVideo> = {
  "dnevna-soba": { label: "Дневна соба", video: "/videos/stanbena-zgrada/dnevna-soba.mp4" },
  kujna: { label: "Кујна и трпезарија", video: "/videos/stanbena-zgrada/kujna.mp4" },
  dvor: { label: "Двор", video: "/videos/stanbena-zgrada/dvor.mp4" },
};

// Numbered badges on the floor-plan image, matched by eye to the render.
// Only numbers with a linked room are clickable; the rest are shown as-is.
const HOTSPOTS: { number: number; top: string; left: string; room?: keyof typeof ROOMS }[] = [
  { number: 1, top: "34.0%", left: "31.8%" },
  { number: 2, top: "44.2%", left: "70.3%", room: "dnevna-soba" },
  { number: 3, top: "22.2%", left: "76.0%", room: "kujna" },
  { number: 4, top: "60.7%", left: "21.2%" },
  { number: 5, top: "71.5%", left: "47.8%" },
  { number: 6, top: "39.8%", left: "15.4%" },
  { number: 7, top: "27.8%", left: "55.6%", room: "kujna" },
  { number: 8, top: "87.5%", left: "77.1%", room: "dvor" },
  { number: 9, top: "95.1%", left: "12.4%" },
];

export function StanbenaFloorPlan() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeRoom, setActiveRoom] = useState<keyof typeof ROOMS | null>(null);

  return (
    <>
      <div className="relative mx-auto aspect-[680/771] w-full max-w-md overflow-hidden border border-line">
        <Media
          image={{
            src: "/images/stanbena-zgrada/floorplan-numbered.webp",
            alt: "Распоред на просториите — четирисобен стан",
            isPlaceholder: false,
          }}
          className="h-full w-full"
          sizes="(max-width: 640px) 100vw, 448px"
        />

        {HOTSPOTS.map((spot) => {
          const isClickable = Boolean(spot.room);
          const isHovered = hovered === spot.number;

          return (
            <button
              key={spot.number}
              type="button"
              disabled={!isClickable}
              onClick={() => spot.room && setActiveRoom(spot.room)}
              onMouseEnter={() => isClickable && setHovered(spot.number)}
              onMouseLeave={() => setHovered(null)}
              aria-label={spot.room ? `Пушти видео — ${ROOMS[spot.room].label}` : undefined}
              className={cn(
                "focus-ring absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform",
                isClickable ? "cursor-pointer" : "cursor-default"
              )}
              style={{ top: spot.top, left: spot.left }}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold shadow-md transition-all",
                  isClickable
                    ? isHovered
                      ? "scale-110 bg-accent text-charcoal ring-4 ring-accent/30"
                      : "bg-charcoal/80 text-warm-white ring-2 ring-warm-white/60"
                    : "bg-charcoal/60 text-warm-white/90"
                )}
              >
                {spot.number}
              </span>
            </button>
          );
        })}
      </div>

      {activeRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/85 p-6"
          onClick={() => setActiveRoom(null)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden border border-line bg-charcoal shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              key={ROOMS[activeRoom].video}
              src={ROOMS[activeRoom].video}
              autoPlay
              loop
              muted
              playsInline
              className="aspect-video h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-charcoal/80 to-transparent p-4">
              <span className="text-sm uppercase tracking-widest text-warm-white">{ROOMS[activeRoom].label}</span>
              <button
                type="button"
                onClick={() => setActiveRoom(null)}
                aria-label="Затвори"
                className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-warm-white/90 text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
