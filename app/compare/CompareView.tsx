"use client";

import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Layers } from "lucide-react";
import { useCompare } from "@/lib/compare-context";
import { idsToParam, parseIds, writeStored } from "@/lib/compare-store";
import { floorLabelOf, getApartment, placeLabel } from "@/data";
import { formatArea, orientationLabel, typeLabel } from "@/lib/format";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

const ROWS: { label: string; get: (a: NonNullable<ReturnType<typeof getApartment>>) => string }[] = [
  { label: "Проект", get: (a) => placeLabel(a).project },
  { label: "Зграда", get: (a) => placeLabel(a).building || "—" },
  { label: "Кат", get: (a) => floorLabelOf(a) },
  { label: "Тип", get: (a) => a.typeLabel ?? (a.bedrooms === 0 ? "Студио" : typeLabel(a.type)) },
  { label: "Соби", get: (a) => String(a.bedrooms) },
  { label: "Бањи", get: (a) => (a.bathrooms > 0 ? String(a.bathrooms) : "—") },
  { label: "Површина", get: (a) => formatArea(a.area, a.areaDecimals) },
  { label: "Тераса", get: (a) => (a.balconyArea > 0 ? formatArea(a.balconyArea, a.areaDecimals) : "—") },
  { label: "Ориентација", get: (a) => (a.orientation ? orientationLabel(a.orientation) : "—") },
];

/**
 * The comparison table. Its list comes from the address (/compare?ids=a,b,c) when it has one, so a link can be
 * shared, and from the saved selection otherwise, so a reload keeps it. The two are kept in step: opening a shared
 * link makes it the saved selection, and a saved selection puts itself into the address.
 */
export function CompareView() {
  const { ids: stored, clear } = useCompare();
  const fromAddress = parseIds(useSearchParams().get("ids"));
  const ids = fromAddress.length > 0 ? fromAddress : stored;
  const selected = ids.map(getApartment).filter((a): a is NonNullable<typeof a> => Boolean(a));
  const addressKey = idsToParam(fromAddress);
  const storedKey = idsToParam(stored);

  // Opening a shared link makes it the saved selection (only on arrival: afterwards the saved selection leads, or
  // clearing it would be undone by the address that has not caught up yet). A saved selection puts itself into the
  // address. writeStored also updates the address while this page is open.
  const arrived = useRef(false);
  useEffect(() => {
    if (!arrived.current) {
      arrived.current = true;
      if (addressKey && addressKey !== storedKey) {
        writeStored(parseIds(addressKey));
        return;
      }
    }
    if (!addressKey && storedKey) writeStored(parseIds(storedKey));
  }, [addressKey, storedKey]);

  return (
    <div className="pt-24 sm:pt-28">
      <section className="mx-auto max-w-5xl px-5 sm:px-8 py-14 lg:px-10">
        <SectionHeading as="h1" eyebrow="Споредба" title="Спореди станови" />

        {selected.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-4 border border-dashed border-line px-6 py-16 sm:py-20 text-center">
            <Layers className="h-8 w-8 text-muted" strokeWidth={1.5} />
            <div>
              <div className="t-h3">Сè уште немате избрано станови</div>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
                Додајте до 3 станови за споредба од листата со достапни единици.
              </p>
            </div>
            <Button href="/development" variant="primary" size="sm">
              Разгледај станови
            </Button>
          </div>
        ) : (
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-40" />
                  {selected.map((a) => (
                    <th key={a.id} className="border-b border-line px-4 pb-4 text-left align-top">
                      <Link
                        href={`/development/apartment/${a.id}`}
                        className="focus-ring block text-lg font-medium hover:text-gold-deep"
                      >
                        Стан {a.number}
                      </Link>
                      <div className="mt-1 text-sm font-normal text-muted">{placeLabel(a).text}</div>
                      <StatusBadge status={a.status} variant="pill" className="mt-2" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-line">
                    <td className="eyebrow py-3 pr-4 text-muted">{row.label}</td>
                    {selected.map((a) => (
                      <td key={a.id} className="px-4 py-3 capitalize text-ink/80">
                        {row.get(a)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={clear} className="focus-ring mt-6 text-sm text-muted hover:text-charcoal">
              Исчисти споредба
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
