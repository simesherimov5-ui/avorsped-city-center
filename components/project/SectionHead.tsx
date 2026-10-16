import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The usual heading of a section: an eyebrow, then a plain h2 (its two halves read as one line, no accent). */
export function SectionHead({
  eyebrow,
  title,
  titleItalic,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  titleItalic: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="eyebrow text-gold-deep">{eyebrow}</div>
      <h2 className="font-display text-(length:--fs-h2) font-normal leading-[1.2]">
        {title}
        {titleItalic}
      </h2>
      {children}
    </div>
  );
}

/** The frame every section of the project page shares: a hairline above, the site's container and section padding. */
export function ProjectSection({
  id,
  label,
  tone = "light",
  className,
  children,
}: {
  id?: string;
  label?: string;
  /** The surface of the section: cream, a slightly deeper cream, or Оникс (with the text in the accent colour). */
  tone?: "light" | "tint" | "dark";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className={cn(tone === "dark" ? "on-dark grain grain--dark" : "on-light grain", "border-t border-line")}
      style={tone === "tint" ? { backgroundColor: "var(--color-limestone)" } : undefined}
    >
      <div className={cn("mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10", className)}>{children}</div>
    </section>
  );
}
