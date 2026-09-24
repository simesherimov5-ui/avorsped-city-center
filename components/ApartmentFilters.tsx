"use client";

import { X } from "lucide-react";
import type { ApartmentFilterState } from "@/types";
import { buildings } from "@/data";
import { cn } from "@/lib/cn";

const BEDROOM_OPTIONS = [0, 1, 2, 3, 4];

export function ApartmentFilters({
  value,
  onChange,
  resultsCount,
}: {
  value: ApartmentFilterState;
  onChange: (next: ApartmentFilterState) => void;
  resultsCount?: number;
}) {
  const hasFilters = Object.values(value).some((v) => v !== undefined);

  return (
    <div className="border border-line bg-warm-white p-6">
      <div className="flex items-start justify-between gap-3 border-b border-line pb-5">
        <div>
          <div className="eyebrow text-ink/40">Резултати</div>
          {resultsCount !== undefined && (
            <div className="mt-1.5 font-display text-3xl text-accent">{resultsCount}</div>
          )}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="focus-ring mt-1 flex items-center gap-1.5 text-xs text-ink/50 transition-colors hover:text-charcoal"
          >
            <X className="h-3.5 w-3.5" /> Исчисти
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <Field label="Зграда">
          <select
            className="filter-input"
            value={value.buildingId ?? ""}
            onChange={(e) => onChange({ ...value, buildingId: e.target.value || undefined })}
          >
            <option value="">Било која зграда</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Соби">
          <div className="flex flex-wrap gap-2">
            {BEDROOM_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ ...value, bedrooms: value.bedrooms === n ? undefined : n })}
                className={cn(
                  "focus-ring border px-3 py-1.5 text-sm transition-colors",
                  value.bedrooms === n
                    ? "border-accent bg-accent/10 text-charcoal"
                    : "border-line text-ink/70 hover:border-accent/50"
                )}
              >
                {n === 0 ? "Студио" : n}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Статус">
          <select
            className="filter-input"
            value={value.status ?? ""}
            onChange={(e) =>
              onChange({ ...value, status: (e.target.value || undefined) as ApartmentFilterState["status"] })
            }
          >
            <option value="">Било кој статус</option>
            <option value="available">Достапен</option>
            <option value="reserved">Резервиран</option>
            <option value="sold">Продаден</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Мин. м²">
            <input
              type="number"
              min={0}
              className="filter-input"
              value={value.minArea ?? ""}
              onChange={(e) => onChange({ ...value, minArea: e.target.value ? Number(e.target.value) : undefined })}
            />
          </Field>

          <Field label="Макс. м²">
            <input
              type="number"
              min={0}
              className="filter-input"
              value={value.maxArea ?? ""}
              onChange={(e) => onChange({ ...value, maxArea: e.target.value ? Number(e.target.value) : undefined })}
            />
          </Field>
        </div>

        <Field label="Макс. цена (€)">
          <input
            type="number"
            min={0}
            step={5000}
            className="filter-input"
            value={value.maxPrice ?? ""}
            onChange={(e) => onChange({ ...value, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </Field>
      </div>

      <style jsx global>{`
        .filter-input {
          width: 100%;
          border: 1px solid var(--color-line);
          background: var(--color-warm-white);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          transition: border-color 0.2s ease;
        }
        .filter-input:hover {
          border-color: color-mix(in srgb, var(--color-accent) 50%, var(--color-line));
        }
        .filter-input:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow text-ink/50">{label}</span>
      {children}
    </label>
  );
}
