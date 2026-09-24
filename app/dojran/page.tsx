import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { DojranFloorSelector } from "@/components/DojranFloorSelector";
import { DojranFacade } from "@/components/DojranFacade";
import { projects } from "@/data";

export const metadata: Metadata = {
  title: "Дојрански Рај — Стар Дојран",
  description: "Гарсоњери на чекор од Дојранското Езеро, во Сретеново, Стар Дојран. Изберете кат за да ги видите достапните станови.",
};

export default function DojranPage() {
  const project = projects.find((p) => p.id === "dojranski-raj")!;

  return (
    <div className="pt-28">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <DojranFacade image={project.heroImage} />
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div>
            <div className="eyebrow text-accent">{project.location}</div>
            <h1 className="mt-1.5 font-display text-2xl sm:text-3xl">{project.name}</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{project.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-4">
              {project.specifications.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-sm text-accent">{s.value}</div>
                  <div className="eyebrow mt-1 text-ink/50">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/consultation" variant="primary" size="sm">Закажи консултација</Button>
              <Button href="/contact" variant="secondary" size="sm">Контактирај нè</Button>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Една зграда"
              title="Изберете кат"
              description="Кликнете на кат — на сликата погоре или во листата — за да ги видите достапните станови на тој кат."
            />
            <div className="mt-6">
              <DojranFloorSelector />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
