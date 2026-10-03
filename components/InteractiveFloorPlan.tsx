"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/cn";
import type { FloorPlanExplorerData } from "@/types";

// Generic, data-driven numbered floor-plan diagram: any project can supply its
// own image + hotspot coordinates + per-room video map without a new component.
export function InteractiveFloorPlan({ image, hotspots, rooms }: FloorPlanExplorerData) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  return (
    <>
      <div className="relative mx-auto aspect-[680/771] w-full max-w-md overflow-hidden border border-line">
        <Media image={image} className="h-full w-full" sizes="(max-width: 640px) 100vw, 448px" />

        {hotspots.map((spot) => {
          const room = spot.room ? rooms[spot.room] : undefined;
          const isClickable = Boolean(room);
          const isHovered = hovered === spot.number;

          return (
            <button
              key={spot.number}
              type="button"
              disabled={!isClickable}
              onClick={() => room && setActiveRoom(spot.room ?? null)}
              onMouseEnter={() => isClickable && setHovered(spot.number)}
              onMouseLeave={() => setHovered(null)}
              aria-label={room ? `Пушти видео — ${room.label}` : undefined}
              className={cn(
                // 44px hit area around the 32px marker
                "focus-ring absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform",
                isClickable ? "cursor-pointer" : "cursor-default"
              )}
              style={{ top: spot.top, left: spot.left }}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold shadow-md transition-all",
                  isClickable
                    ? isHovered
                      ? "scale-110 bg-accent text-chrome ring-4 ring-accent/30"
                      : "bg-chrome/80 text-on-chrome ring-2 ring-on-chrome/60"
                    : "bg-chrome/75 text-on-chrome"
                )}
              >
                {spot.number}
              </span>
            </button>
          );
        })}
      </div>

      {activeRoom && rooms[activeRoom] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-chrome/85 p-6"
          onClick={() => setActiveRoom(null)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden border border-line bg-chrome shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              key={rooms[activeRoom].video}
              src={rooms[activeRoom].video}
              poster={rooms[activeRoom].poster}
              preload="none"
              autoPlay
              loop
              muted
              playsInline
              className="aspect-video h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-chrome/80 to-transparent p-4">
              <span className="text-sm uppercase tracking-widest text-on-chrome">{rooms[activeRoom].label}</span>
              <button
                type="button"
                onClick={() => setActiveRoom(null)}
                aria-label="Затвори"
                className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-on-chrome/90 text-chrome"
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
