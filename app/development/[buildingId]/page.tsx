import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getBuilding, apartments, buildings, development } from "@/data";
import { availabilityCounts } from "@/data";
import { Media } from "@/components/ui/Media";
import { FloorList } from "@/components/FloorList";
import { StatusLegend } from "@/components/ui/StatusBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STATUS_LABEL: Record<string, string> = {
  planning: "Планирање",
  foundation: "Темели",
  structure: "Конструкција",
  exterior: "Фасада",
  interior: "Внатрешно доуредување",
  completed: "Завршено",
};

export function generateStaticParams() {
  return buildings.map((b) => ({ buildingId: b.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ buildingId: string }>;
}): Promise<Metadata> {
  const { buildingId } = await params;
  const building = getBuilding(buildingId);
  return { title: building ? `${building.name} — ${development.name}` : "Зграда" };
}

export default async function BuildingPage({
  params,
}: {
  params: Promise<{ buildingId: string }>;
}) {
  const { buildingId } = await params;
  const building = getBuilding(buildingId);
  if (!building) notFound();

  const units = apartments.filter((a) => a.buildingId === building.id);
  const counts = availabilityCounts(units);

  return (
    <div className="pt-28">
      <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-10">
        <Link href="/development" className="focus-ring inline-flex items-center gap-1 text-sm text-ink/50 hover:text-charcoal">
          <ChevronLeft className="h-4 w-4" /> Назад кон проектот
        </Link>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Media image={building.exteriorImage} className="aspect-[4/3]" />
          <div>
            <SectionHeading eyebrow={STATUS_LABEL[building.status]} title={building.name} />
            <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
              <Stat label="Катови" value={String(building.floors.length)} />
              <Stat label="Станови" value={String(building.totalApartments)} />
              <Stat label="Достапни" value={String(counts.available)} />
              <Stat label="Резервирани" value={String(counts.reserved)} />
              <Stat label="Продадени" value={String(counts.sold)} />
            </dl>
            <StatusLegend className="mt-8" />
          </div>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <SectionHeading eyebrow="Изберете кат" title="Изберете кат за да ја видите основата" align="center" />
          <div className="mt-10">
            <FloorList
              basePath={`/development/${building.id}`}
              floors={building.floors.map((floor) => {
                const units = apartments.filter((a) => a.buildingId === building.id && a.floor === floor.number);
                const available = units.filter((a) => a.status === "available").length;
                return { number: floor.number, label: floor.label, meta: `${units.length} станови · ${available} достапни` };
              })}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-2xl">{value}</div>
      <div className="eyebrow mt-1 text-ink/50">{label}</div>
    </div>
  );
}
