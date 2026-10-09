"use client";

import "./floor-sketch.css";
import type { CSSProperties } from "react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { formatArea, statusLabel } from "@/lib/format";
import { roomsText } from "@/lib/plural";
import type { FloorSketch as FloorSketchData, UnitStatus } from "@/types";

export interface SketchApartment {
  id: string;
  number: string;
  /** Where it is on its level: the shape of that position of the sketch is its. */
  position?: number;
  area: number;
  areaDecimals?: number;
  bedrooms: number;
  status: UnitStatus;
}

/**
 * The architect's floor sketch of a building, with one clickable shape over each apartment of the chosen level and its
 * number at the shape's label point. The image is a lossless line drawing, served as it is and never shown larger than
 * its own pixels. The shapes are an SVG laid exactly over the image (viewBox 0 0 100 100, stretched to fit), so the
 * percent values of the data are its coordinates. The status shows in the shape and, never by colour alone, as a mark
 * on the number. Hovering or focusing a shape tells the parent (`onHover`), so the card of the same apartment can light
 * up too, and the other way round (`hovered`).
 */
export function FloorSketch({
  sketch,
  apartments,
  levelKey,
  hovered = null,
  onHover,
}: {
  sketch: FloorSketchData;
  /** The apartments of the chosen level. */
  apartments: SketchApartment[];
  /** Changes with the level: the numbers are replaced (not the picture). */
  levelKey: string | number;
  hovered?: string | null;
  onHover?: (id: string | null) => void;
}) {
  const { image } = sketch;
  const shown = apartments.flatMap((apartment, index) => {
    const shape = sketch.shapes.find((s) => s.position === apartment.position);
    return shape ? [{ apartment, shape, index }] : [];
  });

  return (
    <div className="fs" style={{ maxWidth: image.width + 34 }}>
      {/* the frame keeps the picture's own proportions, so nothing jumps while it loads */}
      <div className="fs-frame" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
        <Media
          image={image}
          fit="contain"
          crisp
          className="h-full w-full !bg-transparent"
          sizes="(max-width: 1024px) 100vw, 800px"
          priority
        />
        <svg
          className="fs-shapes"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="group"
          aria-label="Станови на катот"
        >
          {shown.map(({ apartment, shape }) => (
            <Link
              key={apartment.id}
              href={`/apartments/${apartment.id}`}
              className={`fs-shape${hovered === apartment.id ? " is-hot" : ""}`}
              data-status={apartment.status}
              aria-label={`Стан ${apartment.number}, ${formatArea(apartment.area, apartment.areaDecimals)}, ${roomsText(apartment.bedrooms)}, ${statusLabel(apartment.status).toLowerCase()}`}
              onMouseEnter={() => onHover?.(apartment.id)}
              onMouseLeave={() => onHover?.(null)}
              onFocus={() => onHover?.(apartment.id)}
              onBlur={() => onHover?.(null)}
            >
              <polygon points={shape.polygon.map((p) => p.join(",")).join(" ")} />
            </Link>
          ))}
        </svg>
        {/* the numbers: replaced, one after the other, whenever the level changes */}
        <div key={levelKey} className="fs-chips" aria-hidden>
          {shown.map(({ apartment, shape, index }) => (
            <span
              key={apartment.id}
              className={`fs-chip${hovered === apartment.id ? " is-hot" : ""}`}
              style={{ left: `${shape.label[0]}%`, top: `${shape.label[1]}%`, "--i": index } as CSSProperties}
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
