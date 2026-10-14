"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";

/**
 * A small pause / play control for anything that moves by itself for more than a few seconds (a film, a slideshow, a
 * rotating quote). A real button, 44px to touch, in the logo gold; `paused` says what it will do next.
 */
export function PauseButton({
  paused,
  onToggle,
  className,
}: {
  paused: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={paused}
      aria-label={paused ? t("a11y.play") : t("a11y.pause")}
      className={cn(
        "focus-ring inline-flex h-11 w-11 items-center justify-center text-gold transition-colors hover:text-gold-light",
        className
      )}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        {paused ? <path d="M3.5 2 L11.5 7 L3.5 12 Z" /> : <path d="M4.5 2.5 V11.5 M9.5 2.5 V11.5" />}
      </svg>
    </button>
  );
}
