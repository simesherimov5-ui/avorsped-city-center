"use client";

import { useMemo, useState } from "react";
import type { ApartmentFilterState } from "@/types";
import { apartments } from "@/data";
import { ApartmentFilters } from "@/components/ApartmentFilters";
import { ApartmentCard } from "@/components/ApartmentCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function ApartmentsPage() {
  const [filters, setFilters] = useState<ApartmentFilterState>({});

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
        <SectionHeading eyebrow="Пронаоѓач на станови" title="Пронајди го твојот стан" description="Филтрирај секоја единица низ сите шест згради по големина, буџет, соби и достапност." />

        <div className="mt-10">
          <ApartmentFilters value={filters} onChange={setFilters} />
        </div>

        <div className="mt-8 flex items-center justify-between text-sm text-ink/50">
          <span>{results.length} станови одговараат на вашите филтри</span>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((apt) => (
            <ApartmentCard key={apt.id} apartment={apt} />
          ))}
        </div>

        {results.length === 0 && (
          <div className="mt-16 text-center text-ink/50">
            Нема станови кои одговараат на овие филтри. Обидете се со поширока пребарување.
          </div>
        )}
      </section>
    </div>
  );
}
