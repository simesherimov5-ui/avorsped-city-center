"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { Media } from "@/components/ui/Media";
import { Modal } from "@/components/ui/Modal";
import type { Milestone } from "./Timeline";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The photo viewer pop-up of the timeline: the photo large (16:10), the year and sentence under it, a
 * counter, round previous / next buttons and a round close button. Left / right arrow keys and swiping change
 * the milestone with a 0.22s crossfade.
 */
export function PhotoViewer({
  milestones,
  index,
  open,
  onIndex,
  onClose,
}: {
  milestones: Milestone[];
  index: number;
  open: boolean;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const [previous, setPrevious] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const swipe = useRef<number | null>(null);
  const count = milestones.length;

  const go = (to: number) => {
    const next = (to + count) % count;
    if (next === index || count < 2) return;
    setPrevious(index);
    onIndex(next);
  };

  // New photo fades in over the old one (0.22s); the text swaps in the same time.
  useGSAP(
    () => {
      const el = root.current;
      if (!el || previous === null) return;
      const incoming = el.querySelectorAll<HTMLElement>("[data-in]");
      const outgoing = el.querySelectorAll<HTMLElement>("[data-out]");
      const duration = prefersReducedMotion() ? 0 : 0.22;
      gsap.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration, ease: "none" });
      gsap.to(outgoing, { opacity: 0, duration, ease: "none", onComplete: () => setPrevious(null) });
    },
    { scope: root, dependencies: [index, previous] }
  );

  // Left / right arrow keys change the milestone while the viewer is open.
  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
  });
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goRef.current(index - 1);
      if (e.key === "ArrowRight") goRef.current(index + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, index]);

  const layer = (i: number, tag: "data-in" | "data-out") => {
    const m = milestones[i];
    return (
      <div key={`${tag}-${i}`} {...{ [tag]: "" }}>
        {m.image ? (
          <Media
            image={{ ...m.image, isPlaceholder: false }}
            tone="dark"
            sizes="(max-width: 1100px) 100vw, 1100px"
            className="h-full w-full"
          />
        ) : (
          <div className="ab-viewer-frame bk-mono">{m.year}</div>
        )}
      </div>
    );
  };

  const current = milestones[index];
  if (!current) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      label={`${current.year}. ${current.text}`}
      overlay={0.95}
      closeIn="screen"
      className="w-full max-w-[1100px]"
    >
      <div
        ref={root}
        className="ab-viewer"
        onPointerDown={(e: PointerEvent) => {
          swipe.current = e.clientX;
        }}
        onPointerUp={(e: PointerEvent) => {
          if (swipe.current === null) return;
          const dx = e.clientX - swipe.current;
          swipe.current = null;
          if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        <div className="ab-viewer-photo">
          {previous !== null && layer(previous, "data-out")}
          {layer(index, "data-in")}
        </div>
        <div className="ab-viewer-caption" aria-live="polite">
          <span className="ab-viewer-year bk-mono">{current.year}</span>
          <p className="ab-viewer-text bk-serif">{current.text}</p>
        </div>
        {count > 1 && (
          <div className="ab-viewer-nav">
            <button
              type="button"
              className="bk-modal-close"
              onClick={() => go(index - 1)}
              aria-label="Претходна пресвртница"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.25} aria-hidden />
            </button>
            <span className="ab-viewer-count bk-mono">
              {pad(index + 1)} / {pad(count)}
            </span>
            <button
              type="button"
              className="bk-modal-close"
              onClick={() => go(index + 1)}
              aria-label="Следна пресвртница"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.25} aria-hidden />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
