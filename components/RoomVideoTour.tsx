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
          onClick={(e) => {
            if (active !== i) return setActive(i);
            // the video is already here (another video may have paused it): the button plays or pauses it
            const video = e.currentTarget.querySelector("video");
            if (video) void (video.paused ? video.play() : video.pause());
          }}
          aria-label={`Пушти видео — ${room.label}`}
          className="focus-ring group relative block aspect-[4/3] overflow-hidden border border-line bg-chrome text-left"
        >
          {active === i ? (
            <video
              src={room.video}
              poster={room.image.src}
              preload="none"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <>
              <Media
                // the button is named by its label, so the picture inside needs no second description
                image={{ ...room.image, alt: "" }}
                className="h-full w-full transition-transform duration-(--dur-slow) ease-(--ease) group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 256px"
              />
              <div className="absolute inset-0 bg-chrome/25 transition-colors duration-(--dur-fast) group-hover:bg-chrome/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-on-chrome/90 text-chrome transition-transform duration-(--dur-fast) group-hover:scale-110">
                  <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
                </span>
              </div>
            </>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-chrome/80 to-transparent p-3">
            <span className="eyebrow text-accent">{room.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
