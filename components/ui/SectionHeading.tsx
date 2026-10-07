import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  size = "default",
  className,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  /** "compact" for pages whose headings should sit smaller than the site scale. */
  size?: "default" | "compact";
  className?: string;
  /** "h1" for the one main heading of a page; every other section heading stays an h2. */
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn(align === "center" && "mx-auto max-w-2xl text-center", className)}>
      {eyebrow && <div className={cn("eyebrow", tone === "dark" ? "text-accent" : "text-gold-deep")}>{eyebrow}</div>}
      <Heading
        className={cn(
          size === "compact"
            ? "mt-3 font-display text-[clamp(26px,2.8vw,40px)] font-normal leading-[1.1]"
            : cn("mt-4", Heading === "h1" ? "t-h1" : "t-h2"),
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
