import type { UnitStatus } from "@/types";
import { cn } from "@/lib/cn";
import { statusLabel } from "@/lib/format";

/**
 * Status reads from fill/pattern + the label text, never from hue alone —
 * available is the only status that uses gold at all. Exported (not just
 * used internally) since app/development/page.tsx reuses these same
 * classes as bar-meter fills, not just small dots, so each value needs to
 * work as a solid fill rather than a border-only ring.
 */
export const DOT_COLOR: Record<UnitStatus, string> = {
  available: "bg-gold",
  reserved: "hatch-ink bg-ink/5",
  sold: "bg-ink/30",
};

const PILL_STYLE: Record<UnitStatus, string> = {
  available: "border-gold text-ink",
  reserved: "hatch-ink border-ink/40 text-ink/70",
  // Sold is quieter by its border and dot only: the label itself keeps full contrast.
  sold: "border-ink/25 text-ink/70",
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
