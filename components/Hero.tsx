"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";

const HERO_IMAGE = {
  src: "/images/exteriors/exterior-03-day.jpg",
  alt: "City Center — насловна визуелизација",
  isPlaceholder: false,
};

export function Hero() {
  return (
    <section className="relative flex h-[100svh] min-h-[560px] items-center justify-center overflow-hidden bg-charcoal text-warm-white">
      <motion.div
        initial={{ scale: 1.08, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <Media image={HERO_IMAGE} tone="dark" className="h-full w-full" priority sizes="100vw" />
        <div className="absolute inset-0 bg-black/35" />
      </motion.div>

      <div className="relative flex flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="text-xl font-semibold uppercase leading-tight tracking-[0.15em] text-warm-white sm:text-3xl sm:tracking-[0.2em]"
        >
          <div>Добредојдовте</div>
          <div>Вашиот нов дом</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mt-10 leading-none"
        >
          <div className="font-display text-3xl tracking-tight sm:text-5xl">Јавор Шпед</div>
          <div className="mt-3 text-sm font-semibold uppercase tracking-[0.5em] text-accent">Holding</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Button href="/development" variant="primary">Истражи го проектот</Button>
          <Button href="/projects" variant="secondary" tone="dark">Погледни ги проектите</Button>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-warm-white/50"
      >
        <ChevronDown className="h-5 w-5" />
      </motion.div>
    </section>
  );
}
