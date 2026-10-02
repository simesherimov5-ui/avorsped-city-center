"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION, EASE, REVEAL_DISTANCE } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduceMotion = useReducedMotion();
  // Lighter on phones: shorter travel, shorter duration, no stagger delay.
  const isPhone = useMediaQuery("(max-width: 767px)");

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
