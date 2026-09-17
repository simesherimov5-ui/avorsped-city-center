"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { ApartmentFilterState } from "@/types";
import { buildings } from "@/data";
import { cn } from "@/lib/cn";

const BEDROOM_OPTIONS = [0, 1, 2, 3, 4];

export function ApartmentFilters({
  value,
  onChange,
}: {
  value: ApartmentFilterState;
  onChange: (next: ApartmentFilterState) => void;
}) {
  const [open, setOpen] = useState(false);

  const content = (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                "focus-ring border px-3 py-1.5 text-sm",
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

      <Field label="Мин. површина (м²)">
        <input
          type="number"
          min={0}
          className="filter-input"
          value={value.minArea ?? ""}
          onChange={(e) => onChange({ ...value, minArea: e.target.value ? Number(e.target.value) : undefined })}
        />
      </Field>

      <Field label="Макс. површина (м²)">
        <input
          type="number"
          min={0}
          className="filter-input"
          value={value.maxArea ?? ""}
          onChange={(e) => onChange({ ...value, maxArea: e.target.value ? Number(e.target.value) : undefined })}
        />
      </Field>

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

      {Object.values(value).some(Boolean) && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="focus-ring flex items-center gap-1.5 self-end text-sm text-ink/50 hover:text-charcoal"
        >
          <X className="h-3.5 w-3.5" /> Исчисти филтри
        </button>
      )}
    </div>
  );

  return (
    <div className="border border-line bg-warm-white p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="focus-ring flex w-full items-center justify-between gap-2 text-left sm:hidden"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="h-4 w-4" /> Филтрирај станови
        </span>
        <span className="text-xs text-ink/50">{open ? "Сокриј" : "Прикажи"}</span>
      </button>
      <div className={cn("mt-4 sm:mt-0", !open && "hidden sm:block")}>{content}</div>
      <style jsx global>{`
        .filter-input {
          width: 100%;
          border: 1px solid var(--color-line);
          background: var(--color-warm-white);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
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
      <span className="text-xs uppercase tracking-widest text-ink/50">{label}</span>
      {children}
    </label>
  );
}
