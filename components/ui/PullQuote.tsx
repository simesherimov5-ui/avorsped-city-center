import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A line the company stands behind, set large in Playfair italic. `tone` is the surface it sits on: "dark" for Оникс
 * (text Травертин, accent Светол бакар) and "light" for Травертин (text Оникс, accent Бронза). The quotation marks are
 * part of the text the caller passes in.
 */
export function PullQuote({
  children,
  tone = "dark",
  align = "left",
  className,
}: {
  children: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <figure className={cn("m-0", align === "center" && "text-center", className)}>
      <div
        aria-hidden
        className={cn("h-px w-16", tone === "dark" ? "bg-accent" : "bg-gold-deep", align === "center" && "mx-auto")}
      />
      <blockquote
        className={cn(
          "mt-8 font-display text-[clamp(23px,2.8vw,38px)] font-normal italic leading-[1.2] text-balance",
          tone === "dark" ? "text-on-chrome" : "text-charcoal"
        )}
      >
        {children}
      </blockquote>
    </figure>
  );
}
