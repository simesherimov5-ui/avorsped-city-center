"use client";

import Link from "next/link";
import { BedDouble, Compass, Ruler, ArrowRight } from "lucide-react";
import type { Apartment } from "@/types";
import { formatArea, formatPrice, orientationLabel } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Placeholder } from "@/components/ui/Placeholder";
import { getBuilding } from "@/data";
import { useCompare } from "@/lib/compare-context";
import { cn } from "@/lib/cn";
import { spawnClickPulse } from "@/lib/clickPulse";

export function ApartmentCard({ apartment }: { apartment: Apartment }) {
  const building = getBuilding(apartment.buildingId);
  const { ids, toggle, isFull } = useCompare();
  const selected = ids.includes(apartment.id);

  return (
    <div
      onPointerDown={spawnClickPulse}
      className={cn(
        "group relative isolate border bg-warm-white transition-all duration-300",
        selected
          ? "border-accent shadow-[0_18px_40px_-24px_rgba(184,150,46,0.45)]"
          : "border-line hover:border-charcoal/20 hover:shadow-[0_18px_40px_-24px_rgba(27,26,24,0.3)]"
      )}
    >
      <Link href={`/apartments/${apartment.id}`} className="focus-ring block">
        <div className="relative overflow-hidden">
          <Placeholder
            label={`Стан ${apartment.number} — основа`}
            className="aspect-[4/3] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <StatusBadge status={apartment.status} variant="pill" className="absolute left-3 top-3 bg-on-chrome/95" />
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-display text-xl">Стан {apartment.number}</div>
            <div className="mt-1 text-xs text-ink/50">
              {building?.name} · {apartment.floor === 0 ? "Приземје" : `Кат ${apartment.floor}`}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-4 text-xs text-ink/60">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 text-ink/35" strokeWidth={1.5} />
            {apartment.bedrooms === 0 ? "Студио" : `${apartment.bedrooms} соби`}
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5 text-ink/35" strokeWidth={1.5} />
            {formatArea(apartment.area)}
          </span>
          <span className="flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-ink/35" strokeWidth={1.5} />
            {orientationLabel(apartment.orientation)}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-2 border-t border-line pt-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ink/40">Цена</div>
            <div className="mt-0.5 font-display text-2xl text-charcoal">{formatPrice(apartment.price)}</div>
          </div>
          <Link
            href={`/apartments/${apartment.id}`}
            aria-label={`Погледни го стан ${apartment.number}`}
            className="focus-ring mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent text-gold-deep transition-colors hover:bg-accent hover:text-chrome"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <label
          className={cn(
            "mt-4 flex cursor-pointer items-center gap-2 border-t border-line pt-4 text-xs text-ink/50 transition-opacity",
            !selected && isFull && "cursor-not-allowed opacity-40"
          )}
        >
          <input
            type="checkbox"
            checked={selected}
            disabled={!selected && isFull}
            onChange={() => toggle(apartment.id)}
            className="h-3.5 w-3.5 accent-[color:var(--color-accent)]"
          />
          {selected ? "Додаден за споредба" : "Додади за споредба"}
        </label>
      </div>
    </div>
  );
}
