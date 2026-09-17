"use client";

import Link from "next/link";
import type { Apartment } from "@/types";
import { formatArea, formatPrice, orientationLabel } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Placeholder } from "@/components/ui/Placeholder";
import { getBuilding } from "@/data";
import { useCompare } from "@/lib/compare-context";
import { cn } from "@/lib/cn";

export function ApartmentCard({ apartment }: { apartment: Apartment }) {
  const building = getBuilding(apartment.buildingId);
  const { ids, toggle, isFull } = useCompare();
  const selected = ids.includes(apartment.id);

  return (
    <div className="group border border-line bg-warm-white transition-shadow hover:shadow-sm">
      <Link href={`/apartments/${apartment.id}`} className="focus-ring block">
        <Placeholder label={`Стан ${apartment.number} - основа`} className="aspect-[4/3]" />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-display text-lg">Стан {apartment.number}</div>
            <div className="text-xs text-ink/50">
              {building?.name} · {apartment.floor === 0 ? "Приземје" : `Кат ${apartment.floor}`}
            </div>
          </div>
          <StatusBadge status={apartment.status} />
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/70">
          <span>{apartment.bedrooms === 0 ? "Студио" : `${apartment.bedrooms} соби`}</span>
          <span>{formatArea(apartment.area)}</span>
          <span>{orientationLabel(apartment.orientation)}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-medium">{formatPrice(apartment.price)}</span>
          <Link href={`/apartments/${apartment.id}`} className="focus-ring text-sm text-accent hover:underline">
            Погледни го станот
          </Link>
        </div>

        <label
          className={cn(
            "mt-3 flex items-center gap-2 text-xs text-ink/50",
            !selected && isFull && "opacity-40"
          )}
        >
          <input
            type="checkbox"
            checked={selected}
            disabled={!selected && isFull}
            onChange={() => toggle(apartment.id)}
            className="h-3.5 w-3.5 accent-[color:var(--color-accent)]"
          />
          Додади за споредба
        </label>
      </div>
    </div>
  );
}
