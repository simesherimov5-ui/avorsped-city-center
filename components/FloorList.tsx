import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FloorListItem {
  number: number;
  label: string;
  meta: ReactNode;
}

// Generic top-down floor list used by any project with floor-level navigation —
// City Center's per-building floors and Дојрански Рај's single-building floors
// both render through this instead of two near-identical components.
export function FloorList({
  floors,
  basePath,
  activeFloor,
}: {
  floors: FloorListItem[];
  basePath: string;
  activeFloor?: number;
}) {
  const floorsTopDown = [...floors].sort((a, b) => b.number - a.number);

  return (
    <div className="flex flex-col gap-1.5">
      {floorsTopDown.map((floor) => {
        const isActive = activeFloor === floor.number;

        return (
          <Link
            key={floor.number}
            href={`${basePath}/${floor.number}`}
            className={cn(
              "focus-ring group flex items-center justify-between gap-4 border px-4 py-3 text-sm transition-colors",
              isActive
                ? "border-accent bg-accent/10 text-charcoal"
                : "border-line bg-warm-white text-ink/80 hover:border-accent/50 hover:bg-accent/5"
            )}
          >
            <span className="font-medium">{floor.label}</span>
            <span className="text-xs text-ink/50">{floor.meta}</span>
          </Link>
        );
      })}
    </div>
  );
}
