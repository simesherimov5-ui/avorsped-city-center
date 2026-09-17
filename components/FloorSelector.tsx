"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Building } from "@/types";
import { apartments } from "@/data";

export function FloorSelector({
  building,
  activeFloor,
}: {
  building: Building;
  activeFloor?: number;
}) {
  const floorsTopDown = [...building.floors].sort((a, b) => b.number - a.number);

  return (
    <div className="flex flex-col gap-1.5">
      {floorsTopDown.map((floor) => {
          const units = apartments.filter(
            (a) => a.buildingId === building.id && a.floor === floor.number
          );
          const available = units.filter((a) => a.status === "available").length;
          const isActive = activeFloor === floor.number;

          return (
            <Link
              key={floor.number}
              href={`/development/${building.id}/${floor.number}`}
              className={cn(
                "focus-ring group flex items-center justify-between gap-4 border px-4 py-3 text-sm transition-colors",
                isActive
                  ? "border-accent bg-accent/10 text-charcoal"
                  : "border-line bg-warm-white text-ink/80 hover:border-accent/50 hover:bg-accent/5"
              )}
            >
              <span className="font-medium">{floor.label}</span>
              <span className="text-xs text-ink/50">
                {units.length} станови · {available} достапни
              </span>
            </Link>
          );
        })}
    </div>
  );
}
