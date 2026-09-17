import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { apartments, getApartment, getBuilding, getApartmentsForFloor } from "@/data";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const apt = getApartment(id);
  return { title: apt ? `Стан ${apt.number} — City Center` : "Стан" };
}

export default async function ApartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apartment = getApartment(id);
  if (!apartment) notFound();
  const building = getBuilding(apartment.buildingId);
  const floorPlanImage = floorPlanImageForApartment(apartment);
  const isRealFloorPlan = apartment.buildingId === "b06" && apartment.floor === 3;

  const inquiryHref = `/consultation?kind=apartment-inquiry&project=${encodeURIComponent("City Center")}&building=${apartment.buildingId}&apartment=${apartment.id}`;

  const others = getApartmentsForFloor(apartment.buildingId, apartment.floor).filter(
    (a) => a.id !== apartment.id
  );

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
            <div className="text-xs uppercase tracking-widest text-ink/50">
              {building?.name} · {apartment.floor === 0 ? "Приземје" : `Кат ${apartment.floor}`}
            </div>
            <h1 className="mt-1 font-display text-4xl">Стан {apartment.number}</h1>
          </div>
          <StatusBadge status={apartment.status} className="mt-1 text-sm" />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {apartment.gallery.map((img, i) => (
                <Media key={i} image={img} className="aspect-square" />
              ))}
            </div>

            <div>
              <h2 className="font-display text-2xl">Основа и мерења на просториите</h2>
              <div className="mt-6 grid gap-8 md:grid-cols-2">
                <Media
                  image={floorPlanImage}
                  label={`Архитектонска основа на стан ${apartment.number}`}
                  className="aspect-square"
                />
                <div>
                  <table className="w-full text-sm">
                    <tbody>
                      {apartment.rooms.map((room) => (
                        <tr key={room.name} className="border-b border-line">
                          <td className="py-2.5 text-ink/70">{room.name}</td>
                          <td className="py-2.5 text-right font-medium">{formatArea(room.area)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-2.5 font-medium">Вкупна внатрешна површина</td>
                        <td className="py-2.5 text-right font-medium text-accent">{formatArea(apartment.area)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-3 text-xs text-ink/40">
                    {isRealFloorPlan
                      ? `Точна архитектонска основа за Стан ${apartment.number}.`
                      : `Основата е пример за овој тип на стан. Мерењата во табелата се специфични за Стан ${apartment.number}.`}
                  </p>
                </div>
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

          <aside className="h-fit space-y-6 border border-line bg-warm-white p-6">
            <div>
              <div className="text-3xl font-display text-accent">{formatPrice(apartment.price)}</div>
              <div className="mt-1 text-xs text-ink/50">Индикативна цена, подложна на конечна спецификација</div>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Spec label="Тип" value={apartment.bedrooms === 0 ? "Студио" : typeLabel(apartment.type)} />
              <Spec label="Спални соби" value={String(apartment.bedrooms)} />
              <Spec label="Бањи" value={String(apartment.bathrooms)} />
              <Spec label="Површина" value={formatArea(apartment.area)} />
              <Spec label="Балкон" value={formatArea(apartment.balconyArea)} />
              <Spec label="Ориентација" value={orientationLabel(apartment.orientation)} />
              <Spec label="Кат" value={apartment.floor === 0 ? "Приземје" : String(apartment.floor)} />
              <Spec label="Статус" value={statusLabel(apartment.status)} />
            </dl>
            <div className="space-y-3 pt-2">
              <Button href={inquiryHref} variant="primary" className="w-full">
                Прашај за овој стан
              </Button>
              <Button href="/consultation" variant="secondary" className="w-full">
                Закажи консултација
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-ink/40">{label}</dt>
      <dd className="mt-0.5 font-medium capitalize">{value}</dd>
    </div>
  );
}
