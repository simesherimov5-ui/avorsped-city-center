"use client";

import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { BedDouble, Compass, Ruler, ArrowRight } from "lucide-react";
import type { Apartment } from "@/types";
import { formatArea, orientationLabel } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Media } from "@/components/ui/Media";
import { floorPlanImageForApartment } from "@/lib/assets";
import { floorLabelOf, placeLabel } from "@/data";
import { useCompare } from "@/lib/compare-context";
import { cn } from "@/lib/cn";
import { roomsText } from "@/lib/plural";
import { spawnClickPulse } from "@/lib/clickPulse";

export function ApartmentCard({ apartment, priority }: { apartment: Apartment; priority?: boolean }) {
  const place = placeLabel(apartment);
  const { ids, toggle, isFull } = useCompare();
  const selected = ids.includes(apartment.id);

  return (
    <div
      onPointerDown={spawnClickPulse}
      className={cn(
        "group relative isolate border bg-warm-white transition-all duration-300",
        selected ? "border-gold-deep" : "border-line hover:border-ink/30"
      )}
    >
      <Link href={`/apartments/${apartment.id}`} className="focus-ring block">
        <div className="relative overflow-hidden">
          {/* The apartment's own floor plan (or, for units without one, the plan of their type) is the thumbnail. */}
          <Media
            image={floorPlanImageForApartment(apartment)}
            fit="contain"
            crisp={floorPlanImageForApartment(apartment).transparent}
            priority={priority}
            // A sold apartment's picture is dimmed; its status label and name stay at full contrast.
            className={cn(
              "aspect-[4/3] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]",
              apartment.status === "sold" && "opacity-50"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <StatusBadge status={apartment.status} variant="pill" className="absolute left-3 top-3 bg-on-chrome/95" />
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="t-h3">Стан {apartment.number}</div>
            <div className="mt-1 text-xs text-muted">
              {place.text} · {floorLabelOf(apartment)}
            </div>
          </div>
          <Link
            href={`/apartments/${apartment.id}`}
            aria-label={`Погледни го стан ${apartment.number}`}
            className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent text-gold-deep transition-colors hover:bg-accent hover:text-chrome"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 text-muted" strokeWidth={1.5} />
            {apartment.bedrooms === 0 ? "Студио" : roomsText(apartment.bedrooms)}
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5 text-muted" strokeWidth={1.5} />
            {formatArea(apartment.area, apartment.areaDecimals)}
          </span>
          {apartment.orientation && (
            <span className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-muted" strokeWidth={1.5} />
              {orientationLabel(apartment.orientation)}
            </span>
          )}
        </div>

        <label
          className={cn(
            "mt-4 flex min-h-11 cursor-pointer items-center gap-3 border-t border-line pt-4 text-sm text-muted transition-opacity lg:text-xs",
            !selected && isFull && "cursor-not-allowed opacity-40"
          )}
        >
          <input
            type="checkbox"
            checked={selected}
            disabled={!selected && isFull}
            onChange={() => toggle(apartment.id)}
            className="h-5 w-5 accent-[color:var(--color-accent)] lg:h-3.5 lg:w-3.5"
          />
          {selected ? "Додаден за споредба" : "Додади за споредба"}
        </label>
      </div>
    </div>
  );
}
