import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getBuilding, getApartmentsForFloor, buildings, apartments, development } from "@/data";
import { FloorPlan } from "@/components/FloorPlan";
import { FloorList } from "@/components/FloorList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Media } from "@/components/ui/Media";

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

        {floor.officialOverviewImage && (
          <div className="mt-8">
            <div className="eyebrow text-ink/50">Официјална основа на катот</div>
            <Media image={floor.officialOverviewImage} className="mt-3 aspect-[16/10]" />
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_260px]">
          <FloorPlan apartments={units} />
          <div>
            <div className="eyebrow mb-3 text-ink/50">Други катови</div>
            <FloorList
              basePath={`/development/${building.id}`}
              activeFloor={floorNum}
              floors={building.floors.map((f) => {
                const floorUnits = apartments.filter((a) => a.buildingId === building.id && a.floor === f.number);
                const available = floorUnits.filter((a) => a.status === "available").length;
                return { number: f.number, label: f.label, meta: `${floorUnits.length} станови · ${available} достапни` };
              })}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
