import type { Metadata } from "next";
import { Media } from "@/components/ui/Media";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DojranFloorSelector } from "@/components/DojranFloorSelector";
import { projects } from "@/data";

export const metadata: Metadata = {
  title: "Дојрански Рај — Стар Дојран",
  description: "Гарсоњери на чекор од Дојранското Езеро, во Сретеново - Стар Дојран. Изберете кат за да ги видите достапните станови.",
};

export default function DojranPage() {
  const project = projects.find((p) => p.id === "dojranski-raj")!;

  return (
    <div className="pt-28">
      <section className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-10">
        <SectionHeading
          eyebrow={project.location}
          title={project.name}
          description={project.description}
          align="center"
        />
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
          {project.specifications.slice(0, 4).map((s) => (
            <div key={s.label}>
              <div className="font-display text-xl text-accent">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-ink/50">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <Media
            image={project.heroImage}
            label="Дојрански Рај — фасада"
            className="aspect-[16/8]"
            sizes="100vw"
          />
          <div className="mt-12 grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionHeading
                eyebrow="Една зграда"
                title="Изберете кат"
                description="Кликнете на кат за да ги видите достапните станови на тој кат."
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
