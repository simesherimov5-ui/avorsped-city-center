import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import type { Apartment } from "@/types";
import { getBuilding, getApartmentsForFloor, buildings, apartments, development, availabilityCounts } from "@/data";
import { availableWord, unitsText } from "@/lib/plural";
import { pageMetadata } from "@/lib/seo";
import { FloorPlan } from "@/components/FloorPlan";
import { RealFloorPlanViewer } from "@/components/RealFloorPlanViewer";
import { FloorList } from "@/components/FloorList";
import { ZoomEnter, ZoomNavLink } from "@/components/ui/ZoomTransition";

export function generateStaticParams() {
  return buildings.flatMap((b) => b.floors.map((f) => ({ buildingId: b.id, floor: String(f.number) })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ buildingId: string; floor: string }>;
}): Promise<Metadata> {
  const { buildingId, floor } = await params;
  const building = getBuilding(buildingId);
  const floorNumber = Number(floor);
  const level = building?.floors.find((f) => f.number === floorNumber);
  if (!building || !level) return { title: "Кат", robots: { index: false } };
  const units = getApartmentsForFloor(building.id, floorNumber);
  const open = availabilityCounts(units).available;
  return pageMetadata({
    title: `${building.name}, ${level.label} — ${development.name}`,
    description: `${level.label} во ${building.name}: ${unitsText(units.length)}, од кои ${open} ${availableWord(open)}. Изберете стан на основата на катот.`,
    path: `/development/${building.id}/${floorNumber}`,
    image: "/development/opengraph-image",
  });
}

function hasRegion(a: Apartment): a is Apartment & { realPlanRegion: NonNullable<Apartment["realPlanRegion"]> } {
  return Boolean(a.realPlanRegion);
}

export default async function FloorPage({ params }: { params: Promise<{ buildingId: string; floor: string }> }) {
  const { buildingId, floor: floorParam } = await params;
  const building = getBuilding(buildingId);
  const floorNum = Number(floorParam);
  if (!building || Number.isNaN(floorNum)) notFound();

  const floor = building.floors.find((f) => f.number === floorNum);
  if (!floor) notFound();

  const units = getApartmentsForFloor(building.id, floorNum);
  const unitsWithRegions = units.filter(hasRegion);
  // Only switch to the real interactive plan when every unit on this floor has a
  // calibrated region — a partial overlay would be more confusing than the
  // existing schematic diagram, which always covers every unit on any floor.
  const overview = floor.officialOverviewImage;
  const hasRealPlan = Boolean(overview) && units.length > 0 && unitsWithRegions.length === units.length;

  const floorNavItems = building.floors.map((f) => {
    const floorUnits = apartments.filter((a) => a.buildingId === building.id && a.floor === f.number);
    const available = floorUnits.filter((a) => a.status === "available").length;
    return {
      number: f.number,
      label: f.label,
      meta: `${unitsText(floorUnits.length)} · ${available} ${availableWord(available)}`,
    };
  });

  return (
    <ZoomEnter className="pt-24 sm:pt-28">
      {/* A quiet wayfinding line, not a spec header — the visitor already
          arrived through the building, so it doesn't need repeating as a
          prominent heading. The floor plan and its apartments are the
          actual content of this page. */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-8 lg:px-10">
        <nav aria-label="Патека" className="flex items-center gap-1.5 text-sm text-muted sm:text-xs">
          <ZoomNavLink
            href={`/development/${building.id}`}
            label={building.name}
            className="focus-ring inline-flex min-h-11 items-center px-1 transition-colors hover:text-charcoal"
          >
            {building.name}
          </ZoomNavLink>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="text-muted">{floor.label}</span>
        </nav>
        <h1 className="mt-3 font-display text-3xl text-charcoal sm:text-4xl">Изберете го вашиот стан</h1>
      </div>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-10 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px] lg:items-start">
          <div>
            {hasRealPlan && overview ? (
              <RealFloorPlanViewer
                image={overview}
                imageWidth={overview.width}
                imageHeight={overview.height}
                apartments={unitsWithRegions}
                focusRegion={floor.interactiveCropRegion}
              />
            ) : (
              <FloorPlan apartments={units} />
            )}
          </div>
          <div>
            <div className="eyebrow mb-3 text-muted">Други катови</div>
            <FloorList basePath={`/development/${building.id}`} activeFloor={floorNum} floors={floorNavItems} />
          </div>
        </div>

        {overview && (
          <div className="mt-16 border-t border-line pt-12">
            <div className="eyebrow text-gold-deep">Официјална документација</div>
            <h2 className="mt-1.5 font-display text-2xl">Официјална основа на катот</h2>
            <p className="mt-2 max-w-lg text-sm text-muted">
              Оригиналниот архитектонски документ во целост, со мерките на секоја просторија. Користете ги контролите за
              зум за да ги разгледате деталите.
            </p>
            <div className="mt-6 max-w-4xl">
              <RealFloorPlanViewer image={overview} imageWidth={overview.width} imageHeight={overview.height} />
            </div>
          </div>
        )}
      </section>
    </ZoomEnter>
  );
}
