import type { ReactNode } from "react";

/** The grid of a row of stat cells: one column on a phone, three from 640px (the homepage's «Изградени на доверба»). */
export const STAT_GRID = "grid gap-9 sm:grid-cols-3 sm:gap-8 lg:gap-12";

/**
 * One large figure with a short gold rule and its label, centred (the stats of «Изградени на доверба» on Почетна, and
 * of City Center). `tone="dark"` is gold on a dark surface; `tone="light"` is Бронза on a light one, where gold does not
 * read (the rule stays gold).
 */
export function StatCell({
  label,
  tone = "dark",
  children,
}: {
  label: string;
  tone?: "dark" | "light";
  children: ReactNode;
}) {
  const text = tone === "light" ? "text-gold-deep" : "text-accent";
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        className={`font-display text-(length:--fs-hero) leading-[0.95] ${text}`}
        style={{ fontVariantNumeric: "lining-nums tabular-nums" }}
      >
        {children}
      </div>
      <div aria-hidden className="h-px w-12 bg-accent" />
      <div className={`text-label font-semibold uppercase tracking-label ${text}`}>{label}</div>
    </div>
  );
}
