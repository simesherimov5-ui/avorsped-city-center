"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The real Google map of the place, with a pin that drops onto it. The map is centred on the place, so the pin (laid
 * over the middle of the map, its tip on the centre) lands exactly there. When 40% of the map is on screen the pin falls
 * from above and two rings spread from where it lands. With reduced motion the pin is simply there. The map is Google's
 * own embed (it loads Google's content only when it is about to be seen).
 */
export function GoogleMapPin({
  lat,
  lng,
  label,
  zoom = 16,
  className,
}: {
  lat: number;
  lng: number;
  /** What a screen reader calls the map. */
  label: string;
  zoom?: number;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"waiting" | "dropped">("waiting");

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setState("dropped"));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setState("dropped");
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={box}
      className={`relative aspect-[4/3] w-full overflow-hidden border border-line bg-onyx ${className ?? ""}`}
    >
      <iframe
        title={label}
        src={`https://maps.google.com/maps?ll=${lat},${lng}&z=${zoom}&t=m&hl=mk&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0"
      />
      {/* the pin: its tip is on the middle of the map */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
        <span className={`gm-ring ${state === "dropped" ? "is-on" : ""}`} />
        <span className={`gm-ring gm-ring-2 ${state === "dropped" ? "is-on" : ""}`} />
        <svg viewBox="0 0 40 52" className={`gm-pin ${state === "dropped" ? "is-dropped" : ""}`} width="40" height="52">
          <path
            d="M20 51 C20 51 3 31 3 19 A17 17 0 0 1 37 19 C37 31 20 51 20 51 Z"
            fill="var(--color-gold)"
            stroke="var(--color-onyx)"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
          <circle cx="20" cy="19" r="6.5" fill="var(--color-onyx)" />
        </svg>
      </div>
    </div>
  );
}
