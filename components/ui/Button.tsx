"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { spawnClickPulse } from "@/lib/clickPulse";

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
    "relative isolate inline-flex min-h-12 items-center justify-center lg:min-h-0 gap-2 whitespace-nowrap font-medium uppercase transition-[color,background-color,border-color,transform] duration-200 focus-ring active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
    size === "sm" ? "px-5 py-2.5 text-[11px] tracking-[0.14em]" : "px-7 py-3.5 text-xs tracking-[0.16em]"
  );
  const styles = {
    // text-chrome (not text-charcoal): this sits on the fixed gold accent in
    // both themes, and charcoal flips to a light color in dark mode, which
    // would leave light text on gold — a real contrast failure.
    primary: "bg-accent text-chrome hover:bg-accent-soft",
    secondary:
      tone === "dark"
        ? "border border-on-chrome/40 text-on-chrome hover:border-on-chrome hover:bg-on-chrome/10"
        : "border border-charcoal/25 text-charcoal hover:border-charcoal hover:bg-charcoal/5",
    ghost: tone === "dark" ? "text-on-chrome/80 hover:text-on-chrome" : "text-charcoal/70 hover:text-charcoal",
  }[variant];

  const classes = cn(base, styles, className);

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick} onPointerDown={spawnClickPulse}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} onPointerDown={spawnClickPulse} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
