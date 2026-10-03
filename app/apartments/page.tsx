"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SearchX, SlidersHorizontal, X } from "lucide-react";
import type { ApartmentFilterState, Orientation, UnitStatus } from "@/types";
import { apartments } from "@/data";
import { ApartmentFilters } from "@/components/ApartmentFilters";
import { ApartmentCard } from "@/components/ApartmentCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { SORT_OPTIONS, isApartmentSort, sortApartments, type ApartmentSort } from "@/lib/apartment-sort";

// The list shows this many at a time, then "Прикажи повеќе": 184 cards at once made the page tens of thousands of
// pixels tall and its HTML hundreds of kilobytes.
const PAGE_SIZE = 12;

// Keeps the filter state shareable: a link with a query string reopens to
// the same search. Only fields with a real value are written, so a fresh
// visit to /apartments still has a clean URL.
const NUM_KEYS = ["floor", "bedrooms", "minArea", "maxArea", "maxPrice"] as const;
const STR_KEYS = ["buildingId", "status", "orientation"] as const;

function filtersFromParams(params: URLSearchParams): ApartmentFilterState {
  const state: ApartmentFilterState = {};
  for (const key of NUM_KEYS) {
    const raw = params.get(key);
    if (raw !== null && !Number.isNaN(Number(raw))) state[key] = Number(raw);
  }
  for (const key of STR_KEYS) {
    const raw = params.get(key);
    if (raw) (state as Record<string, string>)[key] = raw;
  }
  return state;
}

function paramsFromFilters(filters: ApartmentFilterState, sort: ApartmentSort | ""): string {
  const params = new URLSearchParams();
  if (sort) params.set("sort", sort);
  for (const key of NUM_KEYS) {
    const v = filters[key];
    if (v !== undefined) params.set(key, String(v));
  }
  for (const key of STR_KEYS) {
    const v = filters[key];
    if (v) params.set(key, v);
  }
  return params.toString();
}

export default function ApartmentsPage() {
  const router = useRouter();
  // Starts empty on both server and client (so first paint always matches —
  // no hydration mismatch), then syncs from the real URL right after mount.
  // Deliberately not next/navigation's useSearchParams: that hook forces
  // this page onto a client-only render path via an implicit Suspense
  // boundary, which flashes blank on first load instead of showing the
  // server-rendered list immediately.
  const [filters, setFiltersState] = useState<ApartmentFilterState>({});
  const [sort, setSortState] = useState<ApartmentSort | "">("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = filtersFromParams(params);
    const sortFromUrl = params.get("sort");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate post-mount URL sync (see comment above)
    if (Object.keys(fromUrl).length > 0) setFiltersState(fromUrl);
    if (isApartmentSort(sortFromUrl)) setSortState(sortFromUrl);
  }, []);

  // router.replace (not push) so adjusting a filter never spams browser history.
  const setFilters = useCallback(
    (next: ApartmentFilterState) => {
      setFiltersState(next);
      setVisible(PAGE_SIZE);
      const qs = paramsFromFilters(next, sort);
      router.replace(qs ? `/apartments?${qs}` : "/apartments", { scroll: false });
    },
    [router, sort]
  );

  const setSort = useCallback(
    (next: ApartmentSort | "") => {
      setSortState(next);
      setVisible(PAGE_SIZE);
      const qs = paramsFromFilters(filters, next);
      router.replace(qs ? `/apartments?${qs}` : "/apartments", { scroll: false });
    },
    [router, filters]
  );

  const results = useMemo(() => {
    const matching = apartments.filter((a) => {
      if (filters.buildingId && a.buildingId !== filters.buildingId) return false;
      if (filters.floor !== undefined && a.floor !== filters.floor) return false;
      if (filters.bedrooms !== undefined && a.bedrooms !== filters.bedrooms) return false;
      if (filters.status && a.status !== (filters.status as UnitStatus)) return false;
      if (filters.orientation && a.orientation !== (filters.orientation as Orientation)) return false;
      if (filters.minArea !== undefined && a.area < filters.minArea) return false;
      if (filters.maxArea !== undefined && a.area > filters.maxArea) return false;
      if (filters.maxPrice !== undefined && a.price > filters.maxPrice) return false;
      return true;
    });
    return sortApartments(matching, sort);
  }, [filters, sort]);
  const shown = results.slice(0, visible);

  const sortSelect = (
    <label className="flex items-center gap-3 text-sm text-muted">
      <span className="shrink-0">Подреди</span>
      <select
        value={sort}
        onChange={(e) => setSort(isApartmentSort(e.target.value) ? e.target.value : "")}
        className="filter-input min-h-11 py-2 text-ink"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="pt-24 sm:pt-28">
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-12 lg:px-10">
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
                <span className="font-display text-2xl text-gold-deep">{results.length}</span>
                <span className="ml-2 text-sm text-muted">станови одговараат</span>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="focus-ring flex min-h-11 items-center gap-2 border border-line px-4 py-2 text-base font-medium transition-colors hover:border-accent/50 sm:text-sm"
              >
                <SlidersHorizontal className="h-4 w-4" /> Филтри
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 lg:mt-6">
              <div className="hidden text-sm text-muted lg:block">Станови што одговараат на избраните филтри.</div>
              <div className="ml-auto">{sortSelect}</div>
            </div>

            {results.length > 0 ? (
              <>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {shown.map((apt) => (
                    <ApartmentCard key={apt.id} apartment={apt} />
                  ))}
                </div>
                <div className="mt-10 flex flex-col items-center gap-4">
                  <p role="status" aria-live="polite" className="text-sm text-muted">
                    Прикажани се {shown.length} од {results.length} станови
                  </p>
                  {visible < results.length && (
                    <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                      Прикажи повеќе
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-4 border border-dashed border-line px-6 py-16 sm:py-20 text-center">
                <SearchX className="h-8 w-8 text-muted" strokeWidth={1.5} />
                <div>
                  <div className="font-display text-xl">Нема станови за овие филтри</div>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
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
              className="absolute inset-0 bg-chrome/60"
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-xl bg-cream"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <span className="font-display text-lg">Филтри</span>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Затвори"
                  className="focus-ring flex h-8 w-8 items-center justify-center text-muted"
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
