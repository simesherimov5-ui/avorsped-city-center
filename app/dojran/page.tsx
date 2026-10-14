import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { FloorPickerSection } from "@/components/floor-picker/FloorPickerSection";
import { ConstructionProgress } from "@/components/construction/ConstructionProgress";
import { DojranFacade } from "@/components/DojranFacade";
import { OtherProjects } from "@/components/OtherProjects";
import { ZoomEnter } from "@/components/ui/ZoomTransition";
import { apartmentsOf, projects } from "@/data";
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
      <section className="container-x pb-16 pt-10">
        <div>
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

      <FloorPickerSection
        floors={dojranFloors.map((f) => ({
          number: f.number,
          label: f.label,
          apartments: apartmentsOf("dojranski-raj")
            .filter((a) => a.floor === f.number)
            .map((a) => ({ id: a.id, number: a.number, area: a.area, bedrooms: a.bedrooms, status: a.status })),
        }))}
      />

      <section className="border-t border-line">
        <div className="container-x section-y">
          <ConstructionProgress project={project} always />
        </div>
      </section>

      <OtherProjects currentProjectId="dojranski-raj" />
    </ZoomEnter>
  );
}
