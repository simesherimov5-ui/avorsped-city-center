import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { DojranFloorSelector } from "@/components/DojranFloorSelector";
import { DojranFacade } from "@/components/DojranFacade";
import { projects } from "@/data";

export const metadata: Metadata = {
  title: "Дојрански Рај — Стар Дојран",
  description: "Гарсоњери на чекор од Дојранското Езеро, во Сретеново - Стар Дојран. Изберете кат за да ги видите достапните станови.",
};

export default function DojranPage() {
  const project = projects.find((p) => p.id === "dojranski-raj")!;

  return (
    <div className="pt-28">
      <DojranFacade image={project.heroImage} />

      <section className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
        <div className="border border-line bg-warm-white p-5 sm:p-7">
          <div className="text-[11px] uppercase tracking-widest text-accent">{project.location}</div>
          <h1 className="mt-1.5 font-display text-xl sm:text-2xl">{project.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/70">{project.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-4">
            {project.specifications.map((s) => (
              <div key={s.label}>
                <div className="font-display text-sm text-accent">{s.value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-ink/50">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/consultation" variant="primary" size="sm">Закажи консултација</Button>
            <Button href="/contact" variant="secondary" size="sm">Контактирај нè</Button>
          </div>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionHeading
                eyebrow="Една зграда"
                title="Изберете кат"
                description="Кликнете на кат — на сликата погоре или во листата — за да ги видите достапните станови на тој кат."
              />
            </div>
            <div>
              <DojranFloorSelector />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
