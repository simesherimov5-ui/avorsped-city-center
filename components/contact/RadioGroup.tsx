"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type RadioOption = { value: string; content: ReactNode; label: string; className?: string };

/**
 * A real radio group: one choice at a time, Tab moves into and out of the group (to the chosen option, or the
 * first), and the arrow keys move the choice inside it. Visible focus comes from the item class.
 */
export function RadioGroup({
  options,
  value,
  onChange,
  label,
  describedBy,
  invalid,
  groupId,
  className,
  itemClassName,
  stagger = false,
}: {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  /** The group's accessible name. */
  label: string;
  describedBy?: string;
  invalid?: boolean;
  /** Lets the form find the group to scroll to it. */
  groupId: string;
  className?: string;
  itemClassName?: string;
  /** The options come in one after another, about 40ms apart (not with reduced motion). */
  stagger?: boolean;
}) {
  const chosen = options.findIndex((o) => o.value === value);
  const tabStop = chosen >= 0 ? chosen : 0;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = options.length - 1;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next < 0) return;
    e.preventDefault();
    onChange(options[next].value);
    e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      data-group={groupId}
      data-stagger={stagger || undefined}
      className={className}
    >
      {options.map((option, i) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={i === chosen}
          aria-label={option.label}
          tabIndex={i === tabStop ? 0 : -1}
          className={cn(itemClassName, option.className)}
          style={stagger ? { animationDelay: `${i * 50}ms` } : undefined}
          onClick={() => onChange(option.value)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {option.content}
        </button>
      ))}
    </div>
  );
}
