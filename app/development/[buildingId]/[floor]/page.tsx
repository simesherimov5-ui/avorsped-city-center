import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Apartment } from "@/types";
import { getBuilding, getApartmentsForFloor, buildings, apartments, development } from "@/data";
import { FloorPlan } from "@/components/FloorPlan";
import { RealFloorPlanViewer } from "@/components/RealFloorPlanViewer";
import { FloorList } from "@/components/FloorList";
import { SectionHeading } from "@/components/ui/SectionHeading";

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
  return { title: building ? `${building.name}, Кат ${floor} — ${development.name}` : "Кат" };
}

function hasRegion(a: Apartment): a is Apartment & { realPlanRegion: NonNullable<Apartment["realPlanRegion"]> } {
  return Boolean(a.realPlanRegion);
}

export default async function FloorPage({
  params,
}: {
  params: Promise<{ buildingId: string; floor: string }>;
}) {
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
    return { number: f.number, label: f.label, meta: `${floorUnits.length} станови · ${available} достапни` };
  });

  return (
    <div className="pt-28">
      <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-10">
        <Link
          href={`/development/${building.id}`}
          className="focus-ring inline-flex items-center gap-1 text-sm text-ink/50 hover:text-charcoal"
        >
          <ChevronLeft className="h-4 w-4" /> Назад кон {building.name}
        </Link>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <SectionHeading eyebrow={building.name} title={`Основа на ${floor.label.toLowerCase()}`} />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_260px] lg:items-start">
          <div>
            {hasRealPlan && overview ? (
              <RealFloorPlanViewer
                image={overview}
                imageWidth={overview.width}
                imageHeight={overview.height}
                apartments={unitsWithRegions}
              />
            ) : (
              <FloorPlan apartments={units} />
            )}
          </div>
          <div>
            <div className="eyebrow mb-3 text-ink/50">Други катови</div>
            <FloorList basePath={`/development/${building.id}`} activeFloor={floorNum} floors={floorNavItems} />
          </div>
        </div>

        {overview && (
          <div className="mt-16 border-t border-line pt-12">
            <div className="eyebrow text-accent">Официјална документација</div>
            <h2 className="mt-1.5 font-display text-2xl">Официјална основа на катот</h2>
            <p className="mt-2 max-w-lg text-sm text-ink/60">
              Оригиналниот архитектонски документ во целост, со мерките на секоја просторија. Користете ги
              контролите за зум за да ги разгледате деталите.
            </p>
            <div className="mt-6 max-w-4xl">
              <RealFloorPlanViewer image={overview} imageWidth={overview.width} imageHeight={overview.height} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
