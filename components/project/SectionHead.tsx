import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The usual heading of a section: an eyebrow, then an h2 whose second half is italic in the accent colour. */
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
        <em className="italic text-gold-deep">{titleItalic}</em>
      </h2>
      {children}
    </div>
  );
}

/** The frame every section of the project page shares: a hairline above, the site's container and section padding. */
export function ProjectSection({
  id,
  label,
  className,
  children,
}: {
  id?: string;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-label={label} className="border-t border-line">
      <div className={cn("mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10", className)}>{children}</div>
    </section>
  );
}
