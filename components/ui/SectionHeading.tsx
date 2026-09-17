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
        <div className={cn("text-xs uppercase tracking-[0.2em]", tone === "dark" ? "text-accent-soft" : "text-accent")}>
          {eyebrow}
        </div>
      )}
      <h2 className={cn("mt-3 font-display text-3xl sm:text-4xl", tone === "dark" ? "text-warm-white" : "text-charcoal")}>
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-base leading-relaxed", tone === "dark" ? "text-warm-white/70" : "text-ink/65")}>
          {description}
        </p>
      )}
    </div>
  );
}
