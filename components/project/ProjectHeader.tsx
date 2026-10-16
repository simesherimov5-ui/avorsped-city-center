import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The project's name with its last word set in italic Бронза (the accent on a light surface). */
/**
 * The top of a project page, on a light surface: where it is, its name in the display serif (plain, no accent word), a few lines about it, a row of facts under thin rules and, if given, the way in. Every project page opens
 * with this, so they read as one family.
 */
export function ProjectHeader({
  eyebrow,
  name,
  description,
  facts,
  children,
  className,
}: {
  eyebrow: string;
  name: string;
  description?: string;
  facts: { label: string; value: string }[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="eyebrow text-gold-deep">{eyebrow}</div>
      <h1 className="mt-3 font-display text-(length:--fs-h1) font-normal leading-[1.04] tracking-[-0.01em] text-charcoal">
        {name}
      </h1>
      {description && <p className="mt-5 max-w-xl text-base font-normal leading-[1.75] text-ink/75">{description}</p>}
      {facts.length > 0 && (
        <dl
          className={cn(
            "mt-8 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4",
            facts.length < 4 && "lg:grid-cols-3",
            facts.length < 3 && "lg:grid-cols-2"
          )}
        >
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1.5 border-t border-line py-4">
              <dt className="eyebrow eyebrow-tight text-muted">{fact.label}</dt>
              <dd className="text-[15px] font-medium leading-snug text-charcoal">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {children && <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{children}</div>}
    </div>
  );
}
