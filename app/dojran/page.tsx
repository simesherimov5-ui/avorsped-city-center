import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { FloorPickerSection } from "@/components/floor-picker/FloorPickerSection";
import { ConstructionProgress } from "@/components/construction/ConstructionProgress";
import { DojranFacade } from "@/components/DojranFacade";
import { OtherProjects } from "@/components/OtherProjects";
import { ZoomEnter } from "@/components/ui/ZoomTransition";
import { projects } from "@/data";
import { dojranFloors } from "@/data/dojran";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Дојрански Рај — гарсоњери во Стар Дојран",
  description:
    "Гарсоњери на чекор од Дојранското Езеро, во Сретеново, Стар Дојран. Изберете кат за да ги видите становите.",
  path: "/dojran",
  image: null,
});

export default function DojranPage() {
  const project = projects.find((p) => p.id === "dojranski-raj")!;

  return (
    <ZoomEnter className="pt-24 sm:pt-28">
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-16 pt-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <DojranFacade image={project.heroImage} />
        </div>

        <div className="mt-12">
          <ProjectHeader
            eyebrow={project.location}
            name={project.name}
            description={project.description}
            facts={project.specifications}
          >
            <Button href="/contact?project=dojranski-raj" variant="primary" size="sm">
              Закажи консултација
            </Button>
          </ProjectHeader>
        </div>
      </section>

      <FloorPickerSection floors={dojranFloors.map((f) => ({ number: f.number, label: f.label, apartments: [] }))} />

      <section className="border-t border-line">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:px-10">
          <ConstructionProgress project={project} always />
        </div>
      </section>

      <OtherProjects currentProjectId="dojranski-raj" />
    </ZoomEnter>
  );
}
