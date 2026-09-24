import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { DojranFloorSelector } from "@/components/DojranFloorSelector";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";
import { dojranFloors, getDojranFloor } from "@/data/dojran";
import { projects } from "@/data";

export function generateStaticParams() {
  return dojranFloors.map((f) => ({ floor: String(f.number) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ floor: string }>;
}): Promise<Metadata> {
  const { floor: floorParam } = await params;
  const floor = getDojranFloor(Number(floorParam));
  return { title: floor ? `${floor.label} — Дојрански Рај` : "Дојрански Рај" };
}

export default async function DojranFloorPage({ params }: { params: Promise<{ floor: string }> }) {
  const { floor: floorParam } = await params;
  const floorNum = Number(floorParam);
  const floor = getDojranFloor(floorNum);
  if (!floor) notFound();

  const project = projects.find((p) => p.id === "dojranski-raj")!;

  return (
    <div className="pt-28">
      <div className="mx-auto max-w-6xl px-6 pt-6 lg:px-10">
        <Link href="/dojran" className="focus-ring inline-flex items-center gap-1 text-sm text-ink/50 hover:text-charcoal">
          <ChevronLeft className="h-4 w-4" /> Назад кон Дојрански Рај
        </Link>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        <SectionHeading eyebrow="Дојрански Рај" title={floor.label} description={`${floor.unitsHint} на овој кат.`} />

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="border border-dashed border-line bg-cream p-8 text-center">
              <div className="font-display text-xl">Наскоро</div>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">
                Детални планови и фотографии за становите на {floor.label.toLowerCase()} следуваат наскоро.
                Контактирајте нè за најнови информации и достапност.
              </p>
              <div className="mt-6">
                <Button href="/consultation" variant="primary">Закажи консултација</Button>
              </div>
            </div>

            <div className="mt-10">
              <PhotoCarousel photos={project.gallery} />
            </div>
          </div>

          <aside>
            <div className="eyebrow mb-4 text-ink/40">Изберете кат</div>
            <DojranFloorSelector activeFloor={floorNum} />
          </aside>
        </div>
      </section>
    </div>
  );
}
