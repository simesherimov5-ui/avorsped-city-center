import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  tone?: "light" | "dark";
  size?: "sm" | "md";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  tone = "light",
  size = "md",
  className,
  type = "button",
  disabled,
}: ButtonProps) {
  const base = cn(
    "inline-flex items-center justify-center gap-2 tracking-wide transition-colors duration-200 focus-ring disabled:opacity-40 disabled:cursor-not-allowed",
    size === "sm" ? "px-4 py-2 text-xs" : "px-6 py-3 text-sm"
  );
  const styles = {
    primary: "bg-accent text-charcoal font-medium hover:bg-accent-soft",
    secondary:
      tone === "dark"
        ? "border border-warm-white/40 text-warm-white hover:bg-warm-white/10"
        : "border border-charcoal/30 text-charcoal hover:bg-charcoal/5",
    ghost:
      tone === "dark"
        ? "text-warm-white/80 hover:text-warm-white"
        : "text-charcoal/70 hover:text-charcoal",
  }[variant];

  const classes = cn(base, styles, className);

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
