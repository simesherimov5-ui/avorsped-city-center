import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { FloorList } from "@/components/FloorList";
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

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
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

          <div>
            <SectionHeading
              eyebrow="Една зграда"
              title="Изберете кат"
              size="compact"
              description="Кликнете на кат — на сликата погоре или во листата — за да ги видите достапните станови на тој кат."
            />
            <div className="mt-6">
              <FloorList
                basePath="/dojran"
                floors={dojranFloors.map((f) => ({ number: f.number, label: f.label, meta: f.unitsHint }))}
              />
            </div>
          </div>
        </div>
      </section>

      <OtherProjects currentProjectId="dojranski-raj" />
    </ZoomEnter>
  );
}
