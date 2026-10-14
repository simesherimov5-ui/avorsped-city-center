"use client";

import "./floor-sketch.css";
import { useEffect, useState, type CSSProperties } from "react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { formatArea, statusLabel } from "@/lib/format";
import { roomsText } from "@/lib/plural";
import type { ApartmentOutline, DrawingImage, UnitStatus } from "@/types";

export interface SketchApartment {
  id: string;
  number: string;
  area: number;
  areaDecimals?: number;
  bedrooms: number;
  status: UnitStatus;
  /** Where it is on the sketch; an apartment without one has no shape. */
  outline?: ApartmentOutline;
}

/** A floor with this many apartments or more gets smaller numbers, so they never overlap. */
const DENSE_FROM = 10;
const FADE_MS = 450;

/**
 * A floor's own sketch (the architect's drawing) with one clickable shape over each of its apartments and the apartment's
 * number at the shape's label point. The drawing is a lossless line drawing, served as it is and never shown larger than
 * its own pixels. The box that holds the picture and the shapes has the sketch's own proportions, whatever they are, and
 * is never taller than min(68vh, 620px). The shapes are an SVG laid exactly over the picture (viewBox 0 0 100 100,
 * stretched to fit), so the percent values of the data are its coordinates. The status shows in the shape and, never by
 * colour alone, as a mark on the number. Hovering or focusing a shape tells the parent (`onHover`), so the card of the
 * same apartment can light up too, and the other way round (`hovered`). When the floor changes the numbers are replaced
 * one after the other; the picture changes (cross-fading, the box easing to the new proportions) only if the new floor
 * has another sketch.
 */
export function FloorSketch({
  image,
  apartments,
  levelKey,
  hovered = null,
  onHover,
}: {
  image: DrawingImage;
  /** The apartments of the chosen floor. */
  apartments: SketchApartment[];
  /** Changes with the floor: the numbers are replaced. */
  levelKey: string | number;
  hovered?: string | null;
  onHover?: (id: string | null) => void;
}) {
  // the picture that is leaving fades out under the new one
  const [shown, setShown] = useState(image);
  const [leaving, setLeaving] = useState<DrawingImage | null>(null);
  if (image.src !== shown.src) {
    setLeaving(shown);
    setShown(image);
  }
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setLeaving(null), FADE_MS + 50);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  const ratio = image.width / image.height;
  const placed = apartments.flatMap((apartment, index) =>
    apartment.outline ? [{ apartment, outline: apartment.outline, index }] : []
  );
  const dense = apartments.length >= DENSE_FROM;

  return (
    <div className="fs">
      {/* the box has the picture's own proportions, so nothing jumps while it loads */}
      <div
        className="fs-box"
        style={{
          aspectRatio: String(ratio),
          width: `min(100%, calc(min(68vh, 620px) * ${ratio}))`,
          maxWidth: image.width,
        }}
      >
        {leaving && (
          <div key={leaving.src} className="fs-layer is-leaving" aria-hidden>
            <Media image={{ ...leaving, alt: "" }} fit="contain" crisp className="h-full w-full !bg-transparent" />
          </div>
        )}
        <div key={shown.src} className={`fs-layer${leaving ? " is-entering" : ""}`}>
          <Media
            image={shown}
            fit="contain"
            crisp
            className="h-full w-full !bg-transparent"
            sizes="(max-width: 1024px) 100vw, 800px"
            priority
          />
        </div>
        <svg
          className="fs-shapes"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="group"
          aria-label="Станови на катот"
        >
          {placed.map(({ apartment, outline }) => (
            <Link
              key={apartment.id}
              href={`/development/apartment/${apartment.id}`}
              className={`fs-shape${hovered === apartment.id ? " is-hot" : ""}`}
              data-status={apartment.status}
              aria-label={`Стан ${apartment.number}, ${formatArea(apartment.area, apartment.areaDecimals)}, ${roomsText(apartment.bedrooms)}, ${statusLabel(apartment.status).toLowerCase()}`}
              onMouseEnter={() => onHover?.(apartment.id)}
              onMouseLeave={() => onHover?.(null)}
              onFocus={() => onHover?.(apartment.id)}
              onBlur={() => onHover?.(null)}
            >
              <polygon points={outline.polygon.map((p) => p.join(",")).join(" ")} />
            </Link>
          ))}
        </svg>
        {/* the numbers: replaced, one after the other, whenever the floor changes */}
        <div key={levelKey} className={`fs-chips${dense ? " is-dense" : ""}`} aria-hidden>
          {placed.map(({ apartment, outline, index }) => (
            <span
              key={apartment.id}
              className={`fs-chip${hovered === apartment.id ? " is-hot" : ""}`}
              style={{ left: `${outline.label[0]}%`, top: `${outline.label[1]}%`, "--i": index } as CSSProperties}
            >
              <StatusMarker status={apartment.status} className="fs-mk" />
              {apartment.number}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
