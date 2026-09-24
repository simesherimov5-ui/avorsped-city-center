"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SearchX, SlidersHorizontal, X } from "lucide-react";
import type { ApartmentFilterState } from "@/types";
import { apartments } from "@/data";
import { ApartmentFilters } from "@/components/ApartmentFilters";
import { ApartmentCard } from "@/components/ApartmentCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

export default function ApartmentsPage() {
  const [filters, setFilters] = useState<ApartmentFilterState>({});
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useMemo(() => {
    return apartments.filter((a) => {
      if (filters.buildingId && a.buildingId !== filters.buildingId) return false;
      if (filters.bedrooms !== undefined && a.bedrooms !== filters.bedrooms) return false;
      if (filters.status && a.status !== filters.status) return false;
      if (filters.minArea !== undefined && a.area < filters.minArea) return false;
      if (filters.maxArea !== undefined && a.area > filters.maxArea) return false;
      if (filters.maxPrice !== undefined && a.price > filters.maxPrice) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="pt-28">
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <SectionHeading
          eyebrow="Пронаоѓач на станови"
          title="Пронајди го твојот стан"
          description="Филтрирај секоја единица низ сите шест згради по големина, буџет, соби и достапност."
        />

        <div className="mt-10 lg:grid lg:grid-cols-[280px_1fr] lg:items-start lg:gap-10">
          <aside className="hidden lg:sticky lg:top-28 lg:block">
            <ApartmentFilters value={filters} onChange={setFilters} resultsCount={results.length} />
          </aside>

          <div>
            <div className="flex items-center justify-between gap-4 border-b border-line pb-4 lg:hidden">
              <div>
                <span className="font-display text-2xl text-accent">{results.length}</span>
                <span className="ml-2 text-sm text-ink/60">станови одговараат</span>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="focus-ring flex items-center gap-2 border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-accent/50"
              >
                <SlidersHorizontal className="h-4 w-4" /> Филтри
              </button>
            </div>

            <div className="mt-6 hidden text-sm text-ink/50 lg:block">
              Прикажани се сите станови што одговараат на избраните филтри.
            </div>

            {results.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((apt) => (
                  <ApartmentCard key={apt.id} apartment={apt} />
                ))}
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-4 border border-dashed border-line px-6 py-20 text-center">
                <SearchX className="h-8 w-8 text-ink/30" strokeWidth={1.5} />
                <div>
                  <div className="font-display text-xl">Нема станови за овие филтри</div>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
                    Обидете се со поширок опсег — на пример зголемете ја максималната цена, површината или изберете
                    друга зграда.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setFilters({})}>
                  Исчисти ги филтрите
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {sheetOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-charcoal/60"
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-xl bg-cream"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <span className="font-display text-lg">Филтри</span>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Затвори"
                  className="focus-ring flex h-8 w-8 items-center justify-center text-ink/60"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                <ApartmentFilters value={filters} onChange={setFilters} />
              </div>
              <div className="border-t border-line p-4">
                <Button variant="primary" className="w-full" onClick={() => setSheetOpen(false)}>
                  Прикажи {results.length} станови
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
