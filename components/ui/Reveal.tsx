"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { DURATION, EASE, REVEAL_DISTANCE } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * Fades and rises into place as it scrolls into view. With `immediate` (for what is on screen when the page opens)
 * it plays at once in plain CSS instead (`.enter` in globals.css), so the text does not wait for the scripts.
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
  const reduceMotion = useReducedMotion();
  // Lighter on phones: shorter travel, shorter duration, no stagger delay.
  const isPhone = useMediaQuery("(max-width: 767px)");

  if (immediate) {
    return (
      <div className="enter" style={{ "--enter-delay": `${delay}s` } as CSSProperties}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : isPhone ? REVEAL_DISTANCE / 2 : REVEAL_DISTANCE }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: reduceMotion ? DURATION.instant : isPhone ? DURATION.base : DURATION.slow,
        delay: reduceMotion || isPhone ? 0 : delay,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
}
