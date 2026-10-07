"use client";

import "./location-map.css";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A place near the pin: its name, the line under it (how far away it is, or how long it takes to walk there), and where
 * it sits on the 400 × 300 drawing. `side` is which side of its dot the text goes on (it keeps clear of the lines).
 */
export interface MapPlace {
  name: string;
  detail: string;
  x: number;
  y: number;
  side?: "left" | "right";
}

const PIN = { x: 200, y: 140 };

/** A right-angled line from the pin to the place: along the longer way first, then the shorter. */
function routeTo(place: MapPlace) {
  const vertical = Math.abs(place.y - PIN.y) >= Math.abs(place.x - PIN.x);
  return vertical ? `M${PIN.x} ${PIN.y} V${place.y} H${place.x}` : `M${PIN.x} ${PIN.y} H${place.x} V${place.y}`;
}

/** The faint grid: a line every 46 across and every 38 down. */
const GRID = [
  ...Array.from({ length: 9 }, (_, i) => `M${20 + i * 46} 0 V300`),
  ...Array.from({ length: 8 }, (_, i) => `M0 ${14 + i * 38} H400`),
].join(" ");

/**
 * A schematic of where the place is, not a real map: a dark 4:3 drawing with a faint grid and one soft band, a
 * Светол бакар pin in the middle with two rings spreading from it, and, when `places` are given, a thin right-angled
 * line from the pin to each one with its name and how far it is. It plays once, when 40% of it is on screen: the pin
 * drops, the lines draw, the labels fade in. The rings keep going. With reduced motion everything is shown, without
 * rings. The caller puts the address and the link to Google Maps under it.
 */
export function LocationMap({
  label,
  places = [],
  className,
}: {
  /** What a screen reader calls the drawing. */
  label: string;
  places?: MapPlace[];
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPlaying(true);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className={cn("lm", playing && "is-on", className)}>
      <svg viewBox="0 0 400 300" role="img" aria-label={label}>
        <path className="lm-grid" d={GRID} />
        <path className="lm-band" d="M0 220 C 90 190, 140 260, 230 230 S 360 170, 400 200" />
        {places.map((place, i) => (
          <path
            key={`route-${place.name}`}
            className="lm-route"
            pathLength={1}
            d={routeTo(place)}
            style={{ animationDelay: `${1.45 + i * 0.3}s` }}
          />
        ))}
        {places.map((place, i) => {
          const left = place.side ? place.side === "left" : place.x > 270;
          const textX = left ? place.x - 10 : place.x + 10;
          return (
            <g key={`place-${place.name}`} className="lm-place" style={{ animationDelay: `${2.8 + i * 0.3}s` }}>
              <circle cx={place.x} cy={place.y} r="4" />
              <text className="lm-name" x={textX} y={place.y - 4} textAnchor={left ? "end" : "start"}>
                {place.name}
              </text>
              <text className="lm-min" x={textX} y={place.y + 8} textAnchor={left ? "end" : "start"}>
                {place.detail}
              </text>
            </g>
          );
        })}
        <circle className="lm-ring" cx={PIN.x} cy={PIN.y} r="10" />
        <circle className="lm-ring lm-ring-2" cx={PIN.x} cy={PIN.y} r="10" />
        <g className="lm-pin">
          <path d="M200 140 c -12 -16 -14 -22 -14 -28 a 14 14 0 0 1 28 0 c 0 6 -2 12 -14 28 z" />
          <circle className="lm-pin-eye" cx="200" cy="112" r="5" />
        </g>
      </svg>
    </div>
  );
}
