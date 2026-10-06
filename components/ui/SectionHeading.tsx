import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  className,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  /** "h1" for the one main heading of a page; every other section heading stays an h2. */
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn(align === "center" && "mx-auto max-w-2xl text-center", className)}>
      {eyebrow && (
        <div className={cn("eyebrow", tone === "dark" ? "text-accent-soft" : "text-gold-deep")}>{eyebrow}</div>
      )}
      <Heading
        className={cn(
          "mt-4 font-display text-3xl sm:text-[2.75rem]",
          tone === "dark" ? "text-on-chrome" : "text-charcoal"
        )}
      >
        {title}
      </Heading>
      {description && (
        <p className={cn("mt-4 text-base leading-relaxed", tone === "dark" ? "text-on-chrome/70" : "text-ink/65")}>
          {description}
        </p>
      )}
    </div>
  );
}
