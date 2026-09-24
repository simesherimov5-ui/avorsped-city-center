import type { UnitStatus } from "@/types";
import { cn } from "@/lib/cn";
import { statusLabel } from "@/lib/format";

export const DOT_COLOR: Record<UnitStatus, string> = {
  available: "bg-emerald-600",
  reserved: "bg-amber-500",
  sold: "bg-ink/40",
};

const PILL_STYLE: Record<UnitStatus, string> = {
  available: "border-emerald-700/20 bg-emerald-700/[0.06] text-emerald-800",
  reserved: "border-amber-600/25 bg-amber-600/[0.08] text-amber-800",
  sold: "border-ink/15 bg-ink/[0.04] text-ink/50",
};

export function StatusBadge({
  status,
  variant = "dot",
  className,
}: {
  status: UnitStatus;
  variant?: "dot" | "pill";
  className?: string;
}) {
  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em]",
          PILL_STYLE[status],
          className
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", DOT_COLOR[status])} aria-hidden />
        {statusLabel(status)}
      </span>
    );
  }

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
