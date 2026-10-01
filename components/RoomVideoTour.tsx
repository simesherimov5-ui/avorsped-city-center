"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Media } from "@/components/ui/Media";

interface Room {
  label: string;
  image: { src: string; alt: string; isPlaceholder: boolean };
  video: string;
}

export function RoomVideoTour({ rooms }: { rooms: Room[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {rooms.map((room, i) => (
        <button
          key={room.label}
          type="button"
          onClick={() => setActive(i)}
          aria-label={`Пушти видео — ${room.label}`}
          className="focus-ring group relative block aspect-[4/3] overflow-hidden border border-line bg-chrome text-left"
        >
          {active === i ? (
            <video src={room.video} autoPlay loop muted playsInline className="h-full w-full object-cover" />
          ) : (
            <>
              <Media
                image={room.image}
                className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-chrome/25 transition-colors duration-300 group-hover:bg-chrome/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-on-chrome/90 text-chrome shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
                </span>
              </div>
            </>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-chrome/80 to-transparent p-3">
            <span className="eyebrow text-on-chrome">{room.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
