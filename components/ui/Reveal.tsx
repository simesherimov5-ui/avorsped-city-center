"use client";

import { motion } from "framer-motion";
import { useCallback, useState, type CSSProperties, type ReactNode } from "react";
import { DURATION, EASE, REVEAL_DISTANCE, REVEAL_VIEWPORT, startsBelowRevealLine } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

const waitsBelowTheLine = (node: HTMLElement) =>
  startsBelowRevealLine(node.getBoundingClientRect().top, window.innerHeight);

/**
 * Fades and rises into place as it scrolls into view. With `immediate` (for what is on screen when the page opens)
 * it plays at once in plain CSS instead (`.enter` in globals.css), so the text does not wait for the scripts.
 *
 * Readable by default: the server's markup is the plain content, with nothing hidden, so it reads without JavaScript,
 * with the scripts blocked or slow, and with reduced motion. Only once this component runs in the browser does a
 * reveal that is still below the screen hide itself and rise in when it gets there (the approved distance, duration and
 * delay); one already on screen, or above it, is left as it is, however late the page hydrates, so nothing that can be read ever
 * disappears. The markup is the same `motion.div` before and after, so nothing is remounted, and it does not depend on the
 * visitor's motion setting (the server cannot know it), so hydration agrees.
 */
export function Reveal({
  children,
  delay = 0,
  immediate = false,
}: {
  children: ReactNode;
  delay?: number;
  immediate?: boolean;
}) {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Lighter on phones: shorter travel, shorter duration, no stagger delay.
  const isPhone = useMediaQuery("(max-width: 767px)");
  // set from the ref below, when the component mounts in the browser: this reveal is below the line and will rise in
  const [waiting, setWaiting] = useState(false);

  // runs once, when the component mounts in the browser (a stable function: React calls a changed one again on every render, and a
  // reveal that was on screen must never be hidden later)
  const start = useCallback((node: HTMLDivElement | null) => {
    if (node && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && waitsBelowTheLine(node)) {
      setWaiting(true);
    }
  }, []);

  if (immediate) {
    return (
      <div className="enter" style={{ "--enter-delay": `${delay}s` } as CSSProperties}>
        {children}
      </div>
    );
  }

  const distance = isPhone ? REVEAL_DISTANCE / 2 : REVEAL_DISTANCE;
  const reveal = {
    duration: reduceMotion ? DURATION.instant : isPhone ? DURATION.base : DURATION.slow,
    delay: reduceMotion || isPhone ? 0 : delay,
    ease: EASE,
  };

  return (
    <motion.div
      data-reveal
      ref={start}
      // hidden at once (no transition) when it starts waiting, then in with the approved timing
      animate={waiting ? { opacity: 0, y: distance, transition: { duration: 0 } } : undefined}
      whileInView={waiting ? { opacity: 1, y: 0, transition: reveal } : undefined}
      viewport={REVEAL_VIEWPORT}
    >
      {children}
    </motion.div>
  );
}
