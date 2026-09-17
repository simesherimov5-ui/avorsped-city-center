import type { UnitStatus } from "@/types";
import { cn } from "@/lib/cn";
import { statusLabel } from "@/lib/format";

const DOT_COLOR: Record<UnitStatus, string> = {
  available: "bg-emerald-600",
  reserved: "bg-amber-500",
  sold: "bg-red-700",
};

export function StatusBadge({ status, className }: { status: UnitStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span className={cn("h-2 w-2 rounded-full", DOT_COLOR[status])} aria-hidden />
      {statusLabel(status)}
    </span>
  );
}

export function StatusLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <StatusBadge status="available" />
      <StatusBadge status="reserved" />
      <StatusBadge status="sold" />
    </div>
  );
}
