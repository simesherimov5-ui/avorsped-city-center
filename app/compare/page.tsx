"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { useCompare } from "@/lib/compare-context";
import { getApartment, getBuilding } from "@/data";
import { formatArea, formatPrice, orientationLabel, typeLabel } from "@/lib/format";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";

const ROWS: { label: string; get: (a: NonNullable<ReturnType<typeof getApartment>>) => string }[] = [
  { label: "Зграда", get: (a) => getBuilding(a.buildingId)?.name ?? "" },
  { label: "Кат", get: (a) => (a.floor === 0 ? "Приземје" : String(a.floor)) },
  { label: "Тип", get: (a) => (a.bedrooms === 0 ? "Студио" : typeLabel(a.type)) },
  { label: "Спални соби", get: (a) => String(a.bedrooms) },
  { label: "Бањи", get: (a) => String(a.bathrooms) },
  { label: "Површина", get: (a) => formatArea(a.area) },
  { label: "Балкон", get: (a) => formatArea(a.balconyArea) },
  { label: "Ориентација", get: (a) => orientationLabel(a.orientation) },
  { label: "Цена", get: (a) => formatPrice(a.price) },
];

export default function ComparePage() {
  const { ids, clear } = useCompare();
  const selected = ids.map(getApartment).filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <div className="pt-28">
      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-10">
        <SectionHeading eyebrow="Споредба" title="Спореди станови" />

        {selected.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-4 border border-dashed border-line px-6 py-20 text-center">
            <Layers className="h-8 w-8 text-ink/30" strokeWidth={1.5} />
            <div>
              <div className="font-display text-xl">Сè уште немате избрано станови</div>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
                Додајте до 3 станови за споредба од листата со достапни единици.
              </p>
            </div>
            <Button href="/apartments" variant="primary" size="sm">Разгледај станови</Button>
          </div>
        ) : (
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-40" />
                  {selected.map((a) => (
                    <th key={a.id} className="border-b border-line px-4 pb-4 text-left align-top">
                      <Link href={`/apartments/${a.id}`} className="focus-ring block font-display text-lg hover:text-accent">
                        Стан {a.number}
                      </Link>
                      <StatusBadge status={a.status} variant="pill" className="mt-2" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => {
                  const isPrice = row.label === "Цена";
                  return (
                    <tr key={row.label} className="border-b border-line">
                      <td className="eyebrow py-3 pr-4 text-ink/40">{row.label}</td>
                      {selected.map((a) => (
                        <td
                          key={a.id}
                          className={cn(
                            "px-4 py-3 capitalize",
                            isPrice ? "font-display text-lg text-accent" : "text-ink/80"
                          )}
                        >
                          {row.get(a)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button onClick={clear} className="focus-ring mt-6 text-sm text-ink/50 hover:text-charcoal">
              Исчисти споредба
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
