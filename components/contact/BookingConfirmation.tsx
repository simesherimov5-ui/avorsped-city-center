"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { Modal } from "@/components/ui/Modal";

/**
 * The pop-up shown after a booking is sent. Inside it, in sequence: a gold ring draws itself (1s) and a check
 * draws inside it (0.45s), then the eyebrow, the thank-you, the booking summary, the note and the button.
 */
export function BookingConfirmation({
  open,
  onClose,
  summary,
}: {
  open: boolean;
  onClose: () => void;
  /** "Стан · 2 соби · Пон 05 окт · 12:00" */
  summary: string;
}) {
  return (
    <Modal open={open} onClose={onClose} label="Барањето е применето" overlay={0.86}>
      <Content onClose={onClose} summary={summary} />
    </Modal>
  );
}

function Content({ onClose, summary }: { onClose: () => void; summary: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const ring = el.querySelector<SVGElement>("[data-ring]");
      const check = el.querySelector<SVGElement>("[data-check]");
      const lines = el.querySelectorAll<HTMLElement>("[data-line]");
      if (prefersReducedMotion()) {
        gsap.set([ring, check], { strokeDashoffset: 0 });
        return;
      }
      gsap.set([ring, check], { strokeDashoffset: 1 });
      gsap.set(lines, { opacity: 0, y: 12 });
      // The panel itself takes 0.7s to arrive; the sequence starts as it settles.
      gsap
        .timeline({ delay: 0.55 })
        .to(ring, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" })
        .to(check, { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" }, "-=0.1")
        .to(lines, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }, "-=0.3");
    },
    { scope: root }
  );

  return (
    <div ref={root} className="ct-confirm">
      <svg className="ct-ring" width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
        <circle data-ring cx="36" cy="36" r="35" pathLength={1} strokeDasharray={1} />
        <path data-check d="M22 37.5l10 10 18-21" pathLength={1} strokeDasharray={1} />
      </svg>
      <div data-line className="bk-eyebrow is-center">
        Барањето е применето
      </div>
      <h2 data-line className="bk-serif">
        Ви благодариме.
      </h2>
      <div data-line className="ct-confirm-sum bk-mono">
        {summary}
      </div>
      <p data-line>Ќе ви се јавиме за потврда на терминот.</p>
      <div data-line>
        <button type="button" data-autofocus className="bk-btn" onClick={onClose}>
          Во ред
        </button>
      </div>
    </div>
  );
}
