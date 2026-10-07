import { cn } from "@/lib/cn";
import { MARK_STROKES, MARK_VIEWBOX } from "@/lib/logo-mark";

/** The building mark: the same drawing the opening builds. Takes its colour from the text colour (`currentColor`). */
export function BuildingMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {MARK_STROKES.map((s) => (
        <path key={s.d} d={s.d} opacity={s.opacity === 1 ? undefined : s.opacity} />
      ))}
    </svg>
  );
}

/**
 * Brand mark matching the company's printed HOLDING card: gold building
 * icon between "HOLDING" and "JAVOR SPED" / "SINCE 1994". `inline` packs
 * it horizontally; `stacked` is the full vertical lockup; `icon` is just
 * the mark on its own, for places that already carry the wordmark nearby
 * (the navbar) or don't need it repeated.
 */
export function Logo({
  variant = "stacked",
  className,
}: {
  variant?: "inline" | "stacked" | "icon";
  className?: string;
}) {
  if (variant === "icon") {
    return <BuildingMark className={cn("h-10 w-auto text-accent", className)} />;
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2.5 text-accent", className)}>
        <BuildingMark className="h-7 w-7 shrink-0" />
        <div className="flex flex-col leading-none">
          <span className="text-[8px] font-semibold uppercase tracking-[0.35em]">Holding</span>
          <span className="mt-1 text-base font-semibold uppercase tracking-wide">Javor Sped</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center text-center leading-none text-accent", className)}>
      <div className="text-sm font-semibold uppercase tracking-[0.4em] sm:text-base">Holding</div>
      <BuildingMark className="my-3 h-10 w-10 sm:h-12 sm:w-12" />
      <div className="text-3xl font-semibold uppercase tracking-wide sm:text-4xl">Javor Sped</div>
      <div className="mt-1.5 text-[11px] uppercase tracking-[0.3em] text-accent sm:text-xs">Since 1994</div>
    </div>
  );
}
