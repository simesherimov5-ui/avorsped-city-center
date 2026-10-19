"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type RadioOption = { value: string; content: ReactNode; label: string; className?: string };

/**
 * A radio group: one choice at a time. Tab moves into and out of the group (to the option last focused, else the chosen
 * one, else the first). The arrow keys, Home and End only move focus between the options; an option is picked only with
 * Enter, Space or a click, because in the booking form a pick also answers the step and moves on. Visible focus comes
 * from the item class.
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
  enterStart = 100,
  enterGap,
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
  /** The options come in one after another, after the step's title (not with reduced motion). */
  stagger?: boolean;
  /** When the first option starts to come in, in ms (the title comes first). */
  enterStart?: number;
  /** The time between two options, in ms: by default 350ms for four options or fewer, 180ms for more. */
  enterGap?: number;
}) {
  const gap = enterGap ?? (options.length <= 4 ? 350 : 180);
  const chosen = options.findIndex((o) => o.value === value);
  // the option the keyboard is on (it keeps the one tab stop of the group)
  const [focused, setFocused] = useState<number | null>(null);
  const tabStop = focused !== null && focused < options.length ? focused : chosen >= 0 ? chosen : 0;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = options.length - 1;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next < 0) return;
    e.preventDefault();
    setFocused(next);
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
          style={stagger ? { animationDelay: `${enterStart + i * gap}ms` } : undefined}
          // a button: Enter and Space click it, so they pick as a click does
          onClick={() => onChange(option.value)}
          onFocus={() => setFocused(i)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {option.content}
        </button>
      ))}
    </div>
  );
}
