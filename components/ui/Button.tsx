"use client";

import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { spawnClickPulse } from "@/lib/clickPulse";

/** The inside of the primary button: the label and the circled arrow (the foil fill is the button's own ::before). */
export function PrimaryFace({ children, arrow = true }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      <span>{children}</span>
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
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
  tone?: "light" | "dark";
  size?: "sm" | "md";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  /** The primary button shown already filled (it still reacts to hover and focus). */
  filled?: boolean;
  /** For a button that switches something on and off: sets aria-pressed. */
  pressed?: boolean;
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
  pressed,
}: ButtonProps) {
  if (variant === "primary") {
    // The filling button has its own look (see .btn-primary in globals.css); no click pulse, it would fight the fill.
    const primary = cn("btn-primary", size === "sm" && "btn-primary--sm", filled && "btn-primary--filled", className);
    const face = <PrimaryFace arrow={size !== "sm"}>{children}</PrimaryFace>;
    if (href) {
      return (
        <Link href={href} className={primary} onClick={onClick} data-tone={tone} aria-pressed={pressed}>
          {face}
        </Link>
      );
    }
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={primary}
        data-tone={tone}
        aria-pressed={pressed}
      >
        {face}
      </button>
    );
  }

  // The second and third levels (see .btn-secondary and .btn-tertiary in globals.css). "ghost" is the older name of
  // the tertiary text link.
  const classes = cn(
    "focus-ring",
    variant === "secondary" ? cn("btn-secondary", size === "sm" && "btn-secondary--sm") : "btn-tertiary",
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        onClick={onClick}
        onPointerDown={spawnClickPulse}
        data-tone={tone}
        aria-pressed={pressed}
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      onPointerDown={spawnClickPulse}
      disabled={disabled}
      className={classes}
      data-tone={tone}
      aria-pressed={pressed}
    >
      {children}
    </button>
  );
}
