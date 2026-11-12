import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { Phone } from "lucide-react";
import {
  apartments,
  floorLabelOf,
  getApartment,
  getBuilding,
  getProject,
  placeLabel,
  placeOf,
  companyInfo,
} from "@/data";
import { formatArea, orientationLabel, typeLabel } from "@/lib/format";
import { floorPlanImageForApartment } from "@/lib/assets";
import { Media } from "@/components/ui/Media";
import { ApartmentTour } from "@/components/ApartmentTour";
import { ApartmentCard } from "@/components/ApartmentCard";
import { Button } from "@/components/ui/Button";
import { ZoomEnter, ZoomNavLink } from "@/components/ui/ZoomTransition";
import { PlanEnlarge } from "@/components/apartment/PlanEnlarge";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return apartments.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const apt = getApartment(id);
  if (!apt) return { title: "Стан", robots: { index: false } };
  const where = placeLabel(apt).text;
  const bedrooms = apt.typeLabel ?? (apt.bedrooms === 0 ? "Студио" : typeLabel(apt.type));
  const facing = apt.orientation ? `, ориентација ${orientationLabel(apt.orientation).toLowerCase()}` : "";
  return pageMetadata({
    title: `Стан ${apt.number}, ${where}`,
    description: `${bedrooms} стан ${apt.number} во ${where}, ${floorLabelOf(apt).toLowerCase()}: ${formatArea(apt.area, apt.areaDecimals)} површина${facing}. Погледнете го распоредот и закажете консултација.`,
    path: `/development/apartment/${apt.id}`,
  });
}

export default async function ApartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apartment = getApartment(id);
  if (!apartment) {
    // an old sample link of a building whose apartments have been replaced by the real ones: the building's page
    const oldBuilding = id.match(/^([a-z0-9]+)-f\d+-/)?.[1];
    if (oldBuilding && getBuilding(oldBuilding)) redirect(`/development/${oldBuilding}`);
    notFound();
  }
  const place = placeLabel(apartment);
  const project = getProject(apartment.projectId);
  const floorPlanImage = floorPlanImageForApartment(apartment);
  // the plan's own proportions (a tall plan gets a tall box, a wide one a wide box), between 0.6 and 2.4
  const planRatio =
    apartment.planImage?.width && apartment.planImage.height
      ? Math.min(2.4, Math.max(0.6, apartment.planImage.width / apartment.planImage.height))
      : 4 / 3;

  const inquiryHref = `/contact?project=${encodeURIComponent(apartment.projectId)}${apartment.buildingId ? `&building=${encodeURIComponent(apartment.buildingId)}` : ""}&apartment=${apartment.id}`;

  // Back to the floor plan where the project has pages per building and floor, otherwise to the project.
  const projectHref = project?.href ?? `/projects/${project?.slug ?? ""}`;
  const back = apartment.buildingId
    ? { href: `${projectHref}/${apartment.buildingId}/${apartment.floor}`, text: "Назад кон основата на катот" }
    : { href: projectHref, text: "Назад кон проектот" };

  const others = apartments.filter(
    (a) =>
      a.projectId === apartment.projectId &&
      placeOf(a) === placeOf(apartment) &&
      a.floor === apartment.floor &&
      a.id !== apartment.id
  );

  const roomsTotalLabel =
    Math.abs(apartment.rooms.reduce((sum, r) => sum + r.area, 0) - apartment.area) < 0.01
      ? "Вкупна површина"
      : "Вкупна внатрешна површина";

  // The page is on Оникс (.on-dark turns every inherited text colour gold); reading text is Травертин, gold only marks:
  // the identification line, the labels, the area and the total.
  return (
    <ZoomEnter className="on-dark pt-24 sm:pt-28">
      <div className="text-travertine">
        <div className="mx-auto max-w-[1280px] px-5 pt-6 sm:px-8 lg:px-10">
          <ZoomNavLink
            href={back.href}
            label={place.building || place.project}
            className="focus-ring -ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-base text-travertine/70 hover:text-travertine sm:text-sm"
          >
            <ChevronLeft className="h-4 w-4" /> {back.text}
          </ZoomNavLink>
        </div>

        <section className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 lg:px-10">
          {/* who this is: the project, the building, the floor, the apartment */}
          <div className="eyebrow text-gold">
            {place.text} · {floorLabelOf(apartment)}
          </div>
          <h1 className="t-h1 mt-1.5 text-travertine">Стан {apartment.number}</h1>

          {/* the plan is the main thing; the facts and the enquiry beside it (under it on a phone) */}
          <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)] lg:items-start lg:gap-10">
            <PlanEnlarge plan={floorPlanImage} apartmentNumber={apartment.number} ratio={planRatio} />

            <aside className="h-fit border border-line bg-warm-white p-6 sm:p-8 lg:sticky lg:top-28">
              <div className="eyebrow text-gold">Површина</div>
              <div className="mt-2 font-display text-[clamp(40px,4vw,56px)] leading-none tabular-nums text-travertine">
                {formatArea(apartment.area, apartment.areaDecimals)}
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-travertine/15 pt-6 text-sm">
                <Spec
                  label="Тип"
                  value={apartment.typeLabel ?? (apartment.bedrooms === 0 ? "Студио" : typeLabel(apartment.type))}
                />
                <Spec label="Соби" value={String(apartment.bedrooms)} />
                {apartment.bathrooms > 0 && <Spec label="Бањи" value={String(apartment.bathrooms)} />}
                {apartment.balconyArea > 0 && (
                  <Spec label="Тераса" value={formatArea(apartment.balconyArea, apartment.areaDecimals)} />
                )}
                {apartment.orientation && <Spec label="Ориентација" value={orientationLabel(apartment.orientation)} />}
                <Spec label="Кат" value={floorLabelOf(apartment)} />
              </dl>

              <div className="mt-6 space-y-3 border-t border-travertine/15 pt-6">
                <Button href={inquiryHref} variant="primary" tone="dark" className="w-full">
                  Прашајте за овој стан
                </Button>
              </div>
              <a
                href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}
                className="focus-ring mt-5 flex min-h-12 items-center justify-center gap-2 border-t border-travertine/15 pt-5 text-base text-travertine/70 transition-colors hover:text-travertine sm:text-sm"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                Или јавете ни се: {companyInfo.phone}
              </a>
            </aside>
          </div>

          {/* the room breakdown, after the plan and the facts */}
          <div className="mt-14 lg:mt-20">
            <h2 className="t-h2 text-travertine">Простор, соба по соба.</h2>
            <table className="mt-6 w-full max-w-3xl text-base">
              <tbody>
                {apartment.rooms.map((room, i) => (
                  <tr key={`${room.name}-${i}`} className="border-b border-travertine/15">
                    <td className="py-3 pr-4 text-travertine">{room.name}</td>
                    <td className="whitespace-nowrap py-3 text-right font-medium tabular-nums text-travertine">
                      {formatArea(room.area, apartment.areaDecimals)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-4 pr-4 font-medium text-travertine">{roomsTotalLabel}</td>
                  <td className="whitespace-nowrap py-4 text-right text-xl font-medium tabular-nums text-gold">
                    {formatArea(apartment.area, apartment.areaDecimals)}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 max-w-3xl text-xs leading-relaxed text-travertine/60">
              {floorPlanImage.isPlaceholder
                ? `Основата за Стан ${apartment.number} ќе биде додадена.`
                : floorPlanImage.isExactMatch
                  ? `Архитектонска основа за Стан ${apartment.number}.`
                  : `Основата е пример за овој тип на стан. Мерењата во табелата се специфични за Стан ${apartment.number}.`}
            </p>
          </div>

          <div className="mt-16 space-y-16">
            {/* The room photos and the 360° tour show only once real media exists: no empty boxes for visitors. */}
            {apartment.gallery.some((img) => !img.isPlaceholder) && (
              <div>
                <h2 className="t-h3 text-travertine">Простории</h2>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
            )}

            {apartment.tour?.available && (
              <div>
                <h2 className="t-h3 text-travertine">Истражете го станот</h2>
                <p className="mt-2 text-sm text-travertine/70">
                  Движете се меѓу просториите, разгледувајте наоколу и зумирајте ги деталите.
                </p>
                <div className="mt-6">
                  <ApartmentTour hasTour={Boolean(apartment.tour?.available)} />
                </div>
              </div>
            )}

            {others.length > 0 && (
              <div>
                <h2 className="t-h3 text-travertine">Други станови на овој кат</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {others.slice(0, 2).map((a) => (
                    <ApartmentCard key={a.id} apartment={a} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </ZoomEnter>
  );
}

const GALLERY_ROOM_LABELS = ["Дневна соба", "Кујна", "Спална соба"];

function roomLabelForGalleryIndex(i: number) {
  return GALLERY_ROOM_LABELS[i] ?? `Просторија ${i + 1}`;
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow eyebrow-tight text-travertine/60">{label}</dt>
      <dd className="mt-1 font-medium capitalize text-travertine">{value}</dd>
    </div>
  );
}
