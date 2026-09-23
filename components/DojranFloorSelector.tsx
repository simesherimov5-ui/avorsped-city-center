import Link from "next/link";
import { cn } from "@/lib/cn";
import { dojranFloors } from "@/data/dojran";

export function DojranFloorSelector({ activeFloor }: { activeFloor?: number }) {
  const floorsTopDown = [...dojranFloors].sort((a, b) => b.number - a.number);

  return (
    <div className="flex flex-col gap-1.5">
      {floorsTopDown.map((floor) => {
        const isActive = activeFloor === floor.number;

        return (
          <Link
            key={floor.number}
            href={`/dojran/${floor.number}`}
            className={cn(
              "focus-ring group flex items-center justify-between gap-4 border px-4 py-3 text-sm transition-colors",
              isActive
                ? "border-accent bg-accent/10 text-charcoal"
                : "border-line bg-warm-white text-ink/80 hover:border-accent/50 hover:bg-accent/5"
            )}
          >
            <span className="font-medium">{floor.label}</span>
            <span className="text-xs text-ink/50">{floor.unitsHint}</span>
          </Link>
        );
      })}
    </div>
  );
}
