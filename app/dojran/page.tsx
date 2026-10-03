import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
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
          <div>
            <div className="eyebrow text-gold-deep">{project.location}</div>
            <h1 className="mt-1.5 font-display text-2xl sm:text-3xl">{project.name}</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{project.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-4">
              {project.specifications.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-sm text-gold-deep">{s.value}</div>
                  <div className="eyebrow mt-1 text-muted">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/contact?project=dojranski-raj" variant="primary" size="sm">
                Закажи консултација
              </Button>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Една зграда"
              title="Изберете кат"
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
