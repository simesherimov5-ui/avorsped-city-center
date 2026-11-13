import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { ChevronLeft } from "lucide-react";
import { getBuilding, apartments, buildings, development } from "@/data";
import { Media } from "@/components/ui/Media";
import { FloorPicker } from "@/components/floor-picker/FloorPicker";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ZoomEnter } from "@/components/ui/ZoomTransition";
import { pageMetadata } from "@/lib/seo";
import { floorsText, unitsText } from "@/lib/plural";

const STATUS_LABEL: Record<string, string> = {
  planning: "Планирање",
  foundation: "Темели",
  structure: "Конструкција",
  exterior: "Фасада",
  interior: "Завршни работи",
  completed: "Завршено",
};

export function generateStaticParams() {
  return buildings.map((b) => ({ buildingId: b.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ buildingId: string }> }): Promise<Metadata> {
  const { buildingId } = await params;
  const building = getBuilding(buildingId);
  if (!building) return { title: "Зграда", robots: { index: false } };
  return pageMetadata({
    title: `${building.name} — ${development.name}`,
    description: `${building.name} во ${development.name}: ${floorsText(building.floors.length)} и ${unitsText(building.totalApartments)}. Изберете кат за да ги видите становите.`,
    path: `/development/${building.id}`,
    image: "/development/opengraph-image",
  });
}

export default async function BuildingPage({ params }: { params: Promise<{ buildingId: string }> }) {
  const { buildingId } = await params;
  const building = getBuilding(buildingId);
  if (!building) notFound();

  const units = apartments.filter((a) => a.buildingId === building.id);

  return (
    <ZoomEnter className="on-dark">
      {/* The intro is a cream block that starts right under the navigation (its top padding is the header's height); it sets
          its own ground with the token because .on-light's own background would win over a utility class. */}
      <div className="on-light pt-[calc(var(--nav-h)+24px)]" style={{ backgroundColor: "var(--color-parchment)" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-6 lg:px-10">
          <Link
            href="/development"
            className="focus-ring -ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-base text-gold-deep hover:text-charcoal sm:text-sm"
          >
            <ChevronLeft className="h-4 w-4" /> Назад кон проектот
          </Link>
        </div>

        {/* From 1024px: the floor picker (the drawn building) on the left, across both rows; the text top right and the photo
            under it. On a phone, in source order: text, floor picker, photo. */}
        <section className="mx-auto max-w-7xl px-5 sm:px-8 py-10 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:items-start">
            <div className="min-w-0 lg:col-start-2 lg:row-start-1">
              <div className="eyebrow text-gold-deep">Вие сте овде</div>
              <SectionHeading as="h1" eyebrow={STATUS_LABEL[building.status]} title={building.name} className="mt-2" />
              <dl className="mt-8 grid grid-cols-2 gap-6">
                <Stat label="Катови" value={String(building.floors.length)} />
                <Stat label="Станови" value={String(building.totalApartments)} />
              </dl>
            </div>
            {/* the old links to #izberete-kat land here; scroll-mt keeps it under the header (the shared --nav-h). Only the
                drawn building is shown; picking a floor opens its page, as the floor buttons did. */}
            <div id="izberete-kat" className="min-w-0 scroll-mt-(--nav-h) lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <FloorPicker
                basePath={`/development/${building.id}`}
                pickOpensFloor
                buildingOnly
                floors={building.floors.map((floor) => ({
                  number: floor.number,
                  label: floor.label,
                  sketch: floor.sketch,
                  apartments: units
                    .filter((a) => a.floor === floor.number)
                    .map((a) => ({
                      id: a.id,
                      number: a.number,
                      area: a.area,
                      areaDecimals: a.areaDecimals,
                      bedrooms: a.bedrooms,
                      outline: a.outline,
                    })),
                }))}
              />
            </div>
            <Media
              image={building.exteriorImage}
              className="aspect-[4/3] lg:col-start-2 lg:row-start-2"
              sizes="(max-width: 1024px) 155vw, 870px"
              priority
            />
          </div>
        </section>
      </div>
    </ZoomEnter>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    // dt (name) then dd (value) is the order a description list needs; the value is shown above its name
    <div className="flex flex-col-reverse">
      <dt className="eyebrow mt-1 text-gold-deep">{label}</dt>
      <dd className="text-2xl font-medium tabular-nums">{value}</dd>
    </div>
  );
}
