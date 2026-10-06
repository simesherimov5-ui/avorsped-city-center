"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import { X } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { cn } from "@/lib/cn";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

type Props = {
  open: boolean;
  onClose: () => void;
  /** The dialog's accessible name. */
  label: string;
  /** Opacity of the black overlay, 0..1. */
  overlay?: number;
  /** Where the round close button sits: inside the panel's corner, or in the corner of the screen. */
  closeIn?: "panel" | "screen";
  /** Classes of the animated content box (width, background, border, padding). */
  className?: string;
  children: ReactNode;
};

/**
 * The one pop-up of the site (booking confirmation, photo viewer). A black overlay fades in and the content
 * rises 24px while scaling 0.97 → 1; with reduced motion it is a plain 0.2s fade. Focus moves inside and is
 * trapped there, Esc / the ✕ / a click on the overlay close it, focus returns to whatever opened it, and the
 * page behind is locked (Lenis paused) while it is open. It renders nothing while closed.
 */
export function Modal({ open, onClose, label, overlay = 0.86, closeIn = "panel", className, children }: Props) {
  // Stays mounted through the exit animation: `open` starts the animation, `shown` ends it.
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);

  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useGSAP(
    () => {
      const dialog = dialogRef.current;
      const backdrop = backdropRef.current;
      const panel = panelRef.current;
      if (!dialog || !backdrop || !panel) return;

      if (prefersReducedMotion()) {
        if (open) gsap.fromTo(dialog, { opacity: 0 }, { opacity: 1, duration: 0.2 });
        else gsap.to(dialog, { opacity: 0, duration: 0.2, onComplete: () => setShown(false) });
        return;
      }

      if (open) {
        gsap.set(backdrop, { opacity: 0 });
        gsap.set(panel, { opacity: 0, y: 24, scale: 0.97 });
        gsap.to(backdrop, { opacity: 1, duration: 0.4, ease: "power2.out" });
        gsap.to(panel, { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.1, ease: "power3.out" });
      } else {
        gsap.to(panel, { opacity: 0, y: 12, duration: 0.3, ease: "power2.in" });
        gsap.to(backdrop, { opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => setShown(false) });
      }
    },
    { dependencies: [open, shown], scope: dialogRef }
  );

  // While it is on screen: lock the page, move focus in, and give focus back afterwards.
  useEffect(() => {
    if (!shown) return;
    const returnTo = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    getLenis()?.stop();

    const dialog = dialogRef.current;
    const first =
      dialog?.querySelector<HTMLElement>("[data-autofocus]") ?? dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialog)?.focus({ preventScroll: true });

    return () => {
      html.style.overflow = previousOverflow;
      getLenis()?.start();
      returnTo?.focus?.({ preventScroll: true });
    };
  }, [shown]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Tab stays inside the dialog: from the last control it wraps to the first, and the other way round.
  const trapTab = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null
    );
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const firstItem = items[0];
    const lastItem = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === firstItem || active === e.currentTarget)) {
      e.preventDefault();
      lastItem.focus();
    } else if (!e.shiftKey && active === lastItem) {
      e.preventDefault();
      firstItem.focus();
    }
  };

  if (!shown || typeof document === "undefined") return null;

  const closeButton = (
    <button
      type="button"
      onClick={onClose}
      aria-label="Затвори"
      className={cn(
        "bk-modal-close",
        closeIn === "screen" ? "absolute right-4 top-4 z-10 sm:right-6 sm:top-6" : "absolute right-3 top-3"
      )}
    >
      <X className="h-5 w-5" strokeWidth={1.25} aria-hidden />
    </button>
  );

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      data-theme="black"
      tabIndex={-1}
      onKeyDown={trapTab}
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-5 outline-none"
    >
      <div
        ref={backdropRef}
        aria-hidden
        onClick={onClose}
        className="absolute inset-0"
        style={{ backgroundColor: `color-mix(in srgb, var(--black) ${Math.round(overlay * 100)}%, transparent)` }}
      />
      <div ref={panelRef} className={cn("relative max-h-full", className)}>
        {children}
        {closeIn === "panel" && closeButton}
      </div>
      {closeIn === "screen" && closeButton}
    </div>,
    document.body
  );
}
