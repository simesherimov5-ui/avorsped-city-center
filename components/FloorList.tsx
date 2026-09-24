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
// both render through this instead of two near-identical components. Styled as
// a numbered rail (echoing the construction-progress story elsewhere on the
// site) rather than a plain link list, so the current floor reads at a glance.
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
    <div className="relative">
      <div className="absolute bottom-4 left-[15px] top-4 w-px bg-line" aria-hidden />
      {floorsTopDown.map((floor) => {
        const isActive = activeFloor === floor.number;

        return (
          <Link
            key={floor.number}
            href={`${basePath}/${floor.number}`}
            aria-current={isActive ? "page" : undefined}
            className="focus-ring group relative flex items-center gap-4 py-2.5"
          >
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                isActive
                  ? "border-accent bg-accent text-charcoal"
                  : "border-line bg-warm-white text-ink/50 group-hover:border-accent/50 group-hover:text-charcoal"
              )}
            >
              {floor.number}
            </span>
            <span className="flex flex-1 items-center justify-between gap-3 border-b border-line pb-2.5 group-last:border-0">
              <span className={cn("text-sm transition-colors", isActive ? "font-semibold text-charcoal" : "text-ink/70 group-hover:text-charcoal")}>
                {floor.label}
              </span>
              <span className="text-xs text-ink/45">{floor.meta}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
