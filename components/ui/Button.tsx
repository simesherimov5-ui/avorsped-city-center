"use client";

import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { spawnClickPulse } from "@/lib/clickPulse";

/** The inside of the filling primary button: the fill that slides in, the label, the circled arrow. */
export function PrimaryFace({ children, arrow = true }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      <span aria-hidden className="btn-primary__fill" />
      <span className="btn-primary__label">{children}</span>
      {arrow && (
        <span aria-hidden className="btn-primary__arrow">
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M0 4h13M9 1l4 3-4 3" />
          </svg>
        </span>
      )}
    </>
  );
}

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  variant?: "primary" | "secondary" | "ghost";
  tone?: "light" | "dark";
  size?: "sm" | "md";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  /** The primary button shown already filled (it still reacts to hover and focus). */
  filled?: boolean;
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
  filled = false,
}: ButtonProps) {
  if (variant === "primary") {
    // The filling button has its own look (see .btn-primary in globals.css); no click pulse, it would fight the fill.
    const primary = cn("btn-primary", size === "sm" && "btn-primary--sm", filled && "btn-primary--filled", className);
    const face = <PrimaryFace arrow={size !== "sm"}>{children}</PrimaryFace>;
    if (href) {
      return (
        <Link href={href} className={primary} onClick={onClick} data-tone={tone}>
          {face}
        </Link>
      );
    }
    return (
      <button type={type} onClick={onClick} disabled={disabled} className={primary} data-tone={tone}>
        {face}
      </button>
    );
  }

  const base = cn(
    "relative isolate inline-flex min-h-12 items-center justify-center lg:min-h-0 gap-2 whitespace-nowrap max-sm:whitespace-normal max-sm:text-center font-medium uppercase transition-[color,background-color,border-color,transform] duration-200 focus-ring active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
    size === "sm" ? "px-5 py-2.5 text-[11px] tracking-[0.14em]" : "px-7 py-3.5 text-xs tracking-[0.16em]"
  );
  const styles = {
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
