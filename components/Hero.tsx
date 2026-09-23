"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { Logo } from "@/components/ui/Logo";
import { development, buildings } from "@/data";

const HERO_IMAGE = {
  src: "/images/exteriors/exterior-03-day.jpg",
  alt: "City Center — насловна визуелизација",
  isPlaceholder: false,
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative flex h-[100svh] min-h-[640px] flex-col overflow-hidden bg-charcoal text-warm-white">
      <motion.div
        initial={{ scale: 1.08, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
        className="absolute inset-0"
      >
        <Media image={HERO_IMAGE} tone="dark" className="h-full w-full" priority sizes="100vw" />
        {/* Layered scrim: darker at the very top (for the header) and bottom
            (for the content block), clearer through the middle so the
            architecture itself stays the focal point. */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/15 to-charcoal/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-charcoal/30" />
      </motion.div>

      <div className="relative flex flex-1 flex-col items-center justify-end px-6 pb-14 text-center sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: EASE }}
          className="eyebrow text-accent-soft"
        >
          Exclusive Building · Основано 1994
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: EASE }}
          className="mt-5 text-xl font-medium uppercase leading-tight tracking-[0.16em] text-warm-white sm:text-3xl sm:tracking-[0.22em] lg:text-4xl"
        >
          <div>Добредојдовте</div>
          <div>Вашиот нов дом</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.9 }}
          className="mt-9"
        >
          <Logo variant="stacked" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.8, ease: EASE }}
          className="mt-9 flex flex-wrap justify-center gap-4"
        >
          <Button href="/development" variant="primary">Истражи го проектот</Button>
          <Button href="/projects" variant="secondary" tone="dark">Погледни ги проектите</Button>
        </motion.div>
      </div>

      {/* Project metadata strip — small, architectural, grounds the hero in
          a real place and scale rather than generic marketing copy. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.9 }}
        className="relative border-t border-warm-white/15"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 py-4 text-center text-[10px] uppercase tracking-[0.2em] text-warm-white/55 sm:flex-row sm:justify-between sm:px-10 sm:text-left sm:text-[11px]">
          <span>{development.location}</span>
          <span className="flex items-center gap-3 sm:gap-5">
            <span>{buildings.length} Згради</span>
            <span className="h-3 w-px bg-warm-white/25" aria-hidden />
            <span>{development.totalApartments} Станови</span>
            <span className="hidden h-3 w-px bg-warm-white/25 sm:block" aria-hidden />
            <span className="hidden sm:inline">{development.expectedCompletion}</span>
          </span>
        </div>
      </motion.div>

      {/* Scroll indicator — a slim animated line rather than a bouncing
          chevron, closer to how architecture studios cue a scroll. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.9 }}
        className="absolute bottom-28 right-6 flex flex-col items-center gap-3 text-warm-white/45 sm:bottom-20 lg:right-10"
      >
        <span className="relative h-9 w-px overflow-hidden bg-warm-white/20">
          <motion.span
            animate={{ y: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="absolute inset-x-0 h-1/2 bg-accent"
          />
        </span>
      </motion.div>
    </section>
  );
}
