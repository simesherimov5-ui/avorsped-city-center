import { existsSync } from "node:fs";
import path from "node:path";
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
  render3dFor,
} from "@/data";
import { formatArea, orientationLabel, typeLabel } from "@/lib/format";
import { floorPlanImageForApartment } from "@/lib/assets";
import { Media } from "@/components/ui/Media";
import { ApartmentTour } from "@/components/ApartmentTour";
import { ApartmentCard } from "@/components/ApartmentCard";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { ZoomEnter, ZoomNavLink } from "@/components/ui/ZoomTransition";
import { PlanEnlarge } from "@/components/apartment/PlanEnlarge";
import { pageMetadata } from "@/lib/seo";
import "@/components/apartment/apartment.css";

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
  // The 3D render mapped to this apartment (only Зграда 02 has them): the tabs show whenever one is mapped; whether its file
  // is in public/ yet is checked here, at build time, so a missing one shows the "coming soon" line instead of a broken request.
  const render3dSrc = render3dFor(apartment.id);
  const render3d = render3dSrc
    ? { src: render3dSrc, available: existsSync(path.join(process.cwd(), "public", render3dSrc)) }
    : undefined;

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

  // the rooms inside, in the order of the drawing: the terraces are in the panel's «Тераса», not in this list
  const indoorRooms = apartment.rooms.filter((room) => !/^(Тераса|Балкон)/.test(room.name));
  const areaDecimals = apartment.areaDecimals;
  const typeName = apartment.typeLabel ?? (apartment.bedrooms === 0 ? "Студио" : typeLabel(apartment.type));

  // The page is on cream (Травертин, between the header and the footer): .on-light gives it the light-surface tokens, so the
  // text is Оникс and the labels, lines and the button are Бронза (components/apartment/apartment.css).
  return (
    <ZoomEnter className="on-light apt-page pt-[calc(var(--nav-h)+24px)]">
      <div>
        <div className="mx-auto max-w-[1280px] px-5 pt-6 sm:px-8 lg:px-10">
          <ZoomNavLink
            href={back.href}
            label={place.building || place.project}
            className="focus-ring -ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-base text-ink/70 hover:text-ink sm:text-sm"
          >
            <ChevronLeft className="h-4 w-4" /> {back.text}
          </ZoomNavLink>
        </div>

        <section className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 lg:px-10">
          {/* who this is: the project, the building, the floor, the apartment */}
          <div className="eyebrow text-gold-deep">
            {place.text} · {floorLabelOf(apartment)}
          </div>
          <h1 className="t-h1 mt-1.5 text-ink">Стан {apartment.number}</h1>

          {/* the plan is the main thing; the facts and the enquiry beside it (under it on a phone) */}
          <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)] lg:items-start lg:gap-10">
            <PlanEnlarge
              plan={floorPlanImage}
              apartmentNumber={apartment.number}
              ratio={planRatio}
              render3d={render3d}
            />

            <aside className="apt-panel lg:sticky lg:top-[calc(var(--nav-h)+24px)]">
              {/* 1 · the total */}
              <div className="apt-total">
                <div className="apt-label">Вкупна површина</div>
                <div className="apt-num">{formatArea(apartment.area, areaDecimals)}</div>
              </div>

              {/* 2 + 3 · the interior area and the terrace */}
              <div className={apartment.balconyArea > 0 ? "apt-two" : "apt-two apt-two--single"}>
                <div>
                  <div className="apt-label">Површина</div>
                  <div className="apt-num">{formatArea(apartment.netArea, areaDecimals)}</div>
                </div>
                {apartment.balconyArea > 0 && (
                  <div>
                    <div className="apt-label">Тераса</div>
                    <div className="apt-num">{formatArea(apartment.balconyArea, areaDecimals)}</div>
                  </div>
                )}
              </div>

              {/* 4 · the type, the bathrooms, the floor */}
              <dl className="apt-facts m-0">
                <div>
                  <dt className="apt-label">Тип</dt>
                  <dd className="apt-fact">{typeName}</dd>
                </div>
                <div>
                  <dt className="apt-label">Бањи</dt>
                  <dd className="apt-fact">{apartment.bathrooms}</dd>
                </div>
                <div>
                  <dt className="apt-label">Кат</dt>
                  <dd className="apt-fact">{floorLabelOf(apartment)}</dd>
                </div>
              </dl>

              {/* 5 · room by room, the rooms inside only */}
              {indoorRooms.length > 0 && (
                <div className="apt-rooms">
                  <div className="apt-label">Соба по соба</div>
                  <ul>
                    {indoorRooms.map((room, i) => (
                      <li key={`${room.name}-${i}`} className="apt-row">
                        <span>{room.name}</span>
                        <span>{formatArea(room.area, areaDecimals)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 6 · the enquiry and the phone */}
              <div className="apt-actions">
                <Link href={inquiryHref} className="apt-cta">
                  Прашајте за овој стан
                </Link>
                <a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`} className="apt-phone">
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Или јавете ни се: {companyInfo.phone}
                </a>
              </div>
            </aside>
          </div>

          {floorPlanImage.isPlaceholder && (
            <p className="mt-3 max-w-3xl text-xs leading-relaxed text-ink/70">
              Основата за Стан {apartment.number} ќе биде додадена.
            </p>
          )}

          <div className="mt-16 space-y-16">
            {/* The room photos and the 360° tour show only once real media exists: no empty boxes for visitors. */}
            {apartment.gallery.some((img) => !img.isPlaceholder) && (
              <div>
                <h2 className="t-h3 text-ink">Простории</h2>
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
                <h2 className="t-h3 text-ink">Истражете го станот</h2>
                <p className="mt-2 text-sm text-ink/70">
                  Движете се меѓу просториите, разгледувајте наоколу и зумирајте ги деталите.
                </p>
                <div className="mt-6">
                  <ApartmentTour hasTour={Boolean(apartment.tour?.available)} />
                </div>
              </div>
            )}

            {others.length > 0 && (
              <div>
                <h2 className="t-h3 text-ink">Други станови на овој кат</h2>
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
