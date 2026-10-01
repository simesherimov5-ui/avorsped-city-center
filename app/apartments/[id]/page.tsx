import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Phone } from "lucide-react";
import {
  apartments,
  getApartment,
  getBuilding,
  getApartmentsForFloor,
  companyInfo,
  development,
  projects,
} from "@/data";
import { formatArea, formatPrice, orientationLabel, statusLabel, typeLabel } from "@/lib/format";
import { floorPlanImageForApartment } from "@/lib/assets";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Media } from "@/components/ui/Media";
import { ApartmentTour } from "@/components/ApartmentTour";
import { ApartmentCard } from "@/components/ApartmentCard";
import { Button } from "@/components/ui/Button";

export function generateStaticParams() {
  return apartments.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const apt = getApartment(id);
  return { title: apt ? `Стан ${apt.number} — ${development.name}` : "Стан" };
}

export default async function ApartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apartment = getApartment(id);
  if (!apartment) notFound();
  const building = getBuilding(apartment.buildingId);
  const floorPlanImage = floorPlanImageForApartment(apartment);
  const cityCenterId = projects.find((p) => p.id === "city-center")?.id ?? "";

  const inquiryHref = `/consultation?kind=apartment-inquiry&project=${encodeURIComponent(cityCenterId)}&building=${apartment.buildingId}&apartment=${apartment.id}`;

  const others = getApartmentsForFloor(apartment.buildingId, apartment.floor).filter((a) => a.id !== apartment.id);

  return (
    <div className="pt-28">
      <div className="mx-auto max-w-6xl px-6 pt-6 lg:px-10">
        <Link
          href={`/development/${apartment.buildingId}/${apartment.floor}`}
          className="focus-ring inline-flex items-center gap-1 text-sm text-ink/50 hover:text-charcoal"
        >
          <ChevronLeft className="h-4 w-4" /> Назад кон основата на катот
        </Link>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="eyebrow text-ink/50">
              {building?.name} · {apartment.floor === 0 ? "Приземје" : `Кат ${apartment.floor}`}
            </div>
            <h1 className="mt-1.5 font-display text-4xl sm:text-5xl">Стан {apartment.number}</h1>
          </div>
          <StatusBadge status={apartment.status} variant="pill" className="mt-2" />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="font-display text-2xl">Архитектонска основа</h2>
              <div className="mt-6 grid gap-8 lg:grid-cols-[3fr_2fr]">
                <div className="relative border border-line bg-cream">
                  <span className="eyebrow absolute left-4 top-4 z-10 bg-warm-white/90 px-2.5 py-1 text-ink/60">
                    Основа
                  </span>
                  <Media
                    image={floorPlanImage}
                    label={`Архитектонска основа на стан ${apartment.number}`}
                    className="aspect-[4/3]"
                  />
                </div>
                <div className="flex flex-col">
                  <table className="w-full text-sm">
                    <tbody>
                      {apartment.rooms.map((room) => (
                        <tr key={room.name} className="border-b border-line">
                          <td className="py-2.5 text-ink/70">{room.name}</td>
                          <td className="py-2.5 text-right font-medium">{formatArea(room.area)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-3 font-medium">Вкупна внатрешна површина</td>
                        <td className="py-3 text-right font-display text-lg text-accent">
                          {formatArea(apartment.area)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-3 text-xs leading-relaxed text-ink/40">
                    {floorPlanImage.isExactMatch
                      ? `Точна архитектонска основа за Стан ${apartment.number}.`
                      : `Основата е пример за овој тип на стан. Мерењата во табелата се специфични за Стан ${apartment.number}.`}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl">Простории</h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {apartment.gallery.map((img, i) => (
                  <Media
                    key={i}
                    image={img}
                    label={`Стан ${apartment.number} — ${roomLabelForGalleryIndex(i)}`}
                    className="aspect-square"
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl">Истражи го станот</h2>
              <p className="mt-2 text-sm text-ink/60">
                {apartment.tour?.available
                  ? "Движете се меѓу просториите, разгледувајте наоколу и зумирајте ги деталите."
                  : "360° виртуелна тура ќе биде додадена штом се направат внатрешни фотографии за оваа единица."}
              </p>
              <div className="mt-6">
                <ApartmentTour hasTour={Boolean(apartment.tour?.available)} />
              </div>
            </div>

            {others.length > 0 && (
              <div>
                <h2 className="font-display text-2xl">Други станови на овој кат</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {others.slice(0, 2).map((a) => (
                    <ApartmentCard key={a.id} apartment={a} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit space-y-6 border border-line bg-warm-white p-6 lg:sticky lg:top-28">
            <div>
              <div className="eyebrow text-ink/40">Цена</div>
              <div className="mt-1.5 font-display text-4xl text-accent">{formatPrice(apartment.price)}</div>
              <div className="mt-1.5 text-xs text-ink/50">Индикативна цена, подложна на конечна спецификација</div>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-6 text-sm">
              <Spec label="Тип" value={apartment.bedrooms === 0 ? "Студио" : typeLabel(apartment.type)} />
              <Spec label="Спални соби" value={String(apartment.bedrooms)} />
              <Spec label="Бањи" value={String(apartment.bathrooms)} />
              <Spec label="Површина" value={formatArea(apartment.area)} />
              <Spec label="Балкон" value={formatArea(apartment.balconyArea)} />
              <Spec label="Ориентација" value={orientationLabel(apartment.orientation)} />
              <Spec label="Кат" value={apartment.floor === 0 ? "Приземје" : String(apartment.floor)} />
              <Spec label="Статус" value={statusLabel(apartment.status)} />
            </dl>
            <div className="space-y-3 border-t border-line pt-6">
              <Button href={inquiryHref} variant="primary" className="w-full">
                Прашај за овој стан
              </Button>
              <Button href="/consultation" variant="secondary" className="w-full">
                Закажи консултација
              </Button>
            </div>
            <a
              href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}
              className="focus-ring flex items-center justify-center gap-2 border-t border-line pt-5 text-sm text-ink/60 transition-colors hover:text-charcoal"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
              Или нè јавете: {companyInfo.phone}
            </a>
          </aside>
        </div>
      </section>
    </div>
  );
}

const GALLERY_ROOM_LABELS = ["Дневна соба", "Кујна", "Спална соба"];

function roomLabelForGalleryIndex(i: number) {
  return GALLERY_ROOM_LABELS[i] ?? `Просторија ${i + 1}`;
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow text-ink/40">{label}</dt>
      <dd className="mt-0.5 font-medium capitalize">{value}</dd>
    </div>
  );
}
