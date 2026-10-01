"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCompare } from "@/lib/compare-context";
import { Button } from "@/components/ui/Button";
import { getApartment } from "@/data";
import { X } from "lucide-react";

export function CompareBar() {
  const { ids, toggle, clear } = useCompare();
  if (ids.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-warm-white/95 backdrop-blur px-4 py-3 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] sm:px-8"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="eyebrow shrink-0 text-ink/50">Споредба ({ids.length}/3)</span>
            {ids.map((id) => {
              const apt = getApartment(id);
              if (!apt) return null;
              return (
                <span
                  key={id}
                  className="flex shrink-0 items-center gap-1.5 border border-line bg-cream px-3 py-1.5 text-xs"
                >
                  Стан {apt.number}
                  <button onClick={() => toggle(id)} aria-label={`Отстрани стан ${apt.number}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clear} className="!px-3">
              Исчисти
            </Button>
            <Button href="/compare" variant="primary" size="sm">
              Спореди
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
