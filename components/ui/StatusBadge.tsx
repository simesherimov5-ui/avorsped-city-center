import type { UnitStatus } from "@/types";
import { cn } from "@/lib/cn";
import { statusLabel } from "@/lib/format";

/**
 * Status never reads from colour alone: the label is always shown, and the marker in front of it differs in shape.
 * Слободен = the accent with a filled dot; Резервиран = the main text colour with an empty ring; Продаден = muted,
 * with a short dash. These classes are for light surfaces, where the accent is Бронза (gold-deep); on dark surfaces
 * a component picks Светол бакар itself (see the floor picker).
 */
const LABEL_COLOR: Record<UnitStatus, string> = {
  available: "text-gold-deep",
  reserved: "text-ink",
  sold: "text-muted",
};

/** The marker before a label: a filled dot, an empty ring or a short dash. `className` sets its size (dot and ring). */
export function StatusMarker({ status, className }: { status: UnitStatus; className?: string }) {
  if (status === "sold") {
    return <span aria-hidden className={cn("inline-block h-px w-2.5 shrink-0 bg-current", className)} />;
  }
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        status === "available" ? "bg-current" : "border border-current",
        className
      )}
    />
  );
}

/**
 * The fills of the availability bar (not the markers): Бронза for available, a hatch for reserved, a muted fill for
 * sold. The hatch and the label keep the bar readable without colour.
 */
export const DOT_COLOR: Record<UnitStatus, string> = {
  available: "bg-gold-deep",
  reserved: "hatch-ink bg-ink/5",
  sold: "bg-ink/30",
};

const PILL_STYLE: Record<UnitStatus, string> = {
  available: "border-gold-deep text-gold-deep",
  reserved: "border-ink/40 text-ink",
  sold: "border-ink/25 text-muted",
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
          "inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-1 text-label font-medium uppercase tracking-label",
          PILL_STYLE[status],
          className
        )}
      >
        <StatusMarker status={status} className="h-1.5 w-1.5" />
        {statusLabel(status)}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", LABEL_COLOR[status], className)}>
      <StatusMarker status={status} />
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
