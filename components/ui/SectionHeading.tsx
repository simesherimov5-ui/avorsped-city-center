import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto max-w-2xl text-center", className)}>
      {eyebrow && (
        <div className={cn("eyebrow", tone === "dark" ? "text-accent-soft" : "text-gold-deep")}>{eyebrow}</div>
      )}
      <h2
        className={cn(
          "mt-4 font-display text-3xl sm:text-[2.75rem]",
          tone === "dark" ? "text-on-chrome" : "text-charcoal"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-base leading-relaxed", tone === "dark" ? "text-on-chrome/70" : "text-ink/65")}>
          {description}
        </p>
      )}
    </div>
  );
}
