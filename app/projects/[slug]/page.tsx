import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { projects } from "@/data";
import { Media } from "@/components/ui/Media";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";
import { RoomVideoTour } from "@/components/RoomVideoTour";
import { InteractiveFloorPlan } from "@/components/InteractiveFloorPlan";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ConstructionTimeline } from "@/components/ConstructionTimeline";
import { OtherProjects } from "@/components/OtherProjects";
import { projectStatusLabel } from "@/lib/format";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return { title: project ? project.name : "Проект" };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <div className="pt-28">
      <div className="mx-auto max-w-6xl px-6 pt-6 lg:px-10">
        <Link href="/projects" className="focus-ring inline-flex items-center gap-1 text-sm text-ink/50 hover:text-charcoal">
          <ChevronLeft className="h-4 w-4" /> Назад кон проектите
        </Link>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        <Reveal>
          {project.gallery.length > 0 ? (
            <PhotoCarousel
              photos={project.gallery}
              className={project.imageFit === "contain" ? "max-w-4xl" : undefined}
              fit={project.imageFit}
            />
          ) : (
            <Media
              image={project.heroImage}
              label={`${project.name} — насловна визуелизација`}
              className="aspect-[16/7]"
              sizes="100vw"
            />
          )}
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-line py-4 text-xs text-ink/50 sm:text-sm">
            <span className="eyebrow text-ink/40">Метаподатоци</span>
            <span>{project.location}</span>
            <span className="text-line">·</span>
            <span>{project.year}</span>
            <span className="text-line">·</span>
            <span>{project.statusLabelOverride ?? projectStatusLabel(project.status)}</span>
            <span className="text-line">·</span>
            <span>{project.units} станови</span>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Reveal delay={0.1}>
              <div className="eyebrow text-gold-deep">{project.location}</div>
              <h1 className="mt-1 font-display text-4xl sm:text-5xl">{project.name}</h1>
              <p className="mt-5 max-w-xl text-lead leading-relaxed text-ink/70">{project.description}</p>
            </Reveal>

            {project.roomTour && (
              <Reveal>
                <div className="mt-14 border-t border-line pt-12">
                  <h2 className="font-display text-2xl">Видео разгледување на просториите</h2>
                  <p className="mt-2 max-w-md text-sm text-ink/60">Кликнете на просторија за да пуштите кратко видео разгледување.</p>
                  <div className="mt-6">
                    <RoomVideoTour rooms={project.roomTour} />
                  </div>
                </div>
              </Reveal>
            )}

            {project.floorPlanExplorer ? (
              <Reveal>
                <div className="mt-14 border-t border-line pt-12">
                  <h2 className="font-display text-2xl">Распоред на просториите</h2>
                  <p className="mt-2 max-w-md text-sm text-ink/60">Кликнете на број за да пуштите видео од таа просторија.</p>
                  <div className="mt-6">
                    <InteractiveFloorPlan {...project.floorPlanExplorer} />
                  </div>
                </div>
              </Reveal>
            ) : (
              project.apartmentTypes && (
                <Reveal>
                  <div className="mt-14 border-t border-line pt-12">
                    <h2 className="font-display text-2xl">Распоред на станови</h2>
                    <div className="mt-6 space-y-8">
                      {project.apartmentTypes.map((type) => (
                        <div key={type.label}>
                          <Media image={type.image} label={type.label} className="aspect-[16/11]" />
                          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-gold-deep">{type.area}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )
            )}

            {project.constructionStages && (
              <Reveal>
                <div className="mt-14 border-t border-line pt-12">
                  <h2 className="font-display text-2xl">Тек на изградба</h2>
                  <div className="mt-6">
                    <ConstructionTimeline stages={project.constructionStages} />
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          <Reveal delay={0.15}>
            <aside className="h-fit space-y-6 border border-line bg-warm-white p-6 lg:sticky lg:top-28">
              <div>
                <div className="eyebrow text-ink/40">Спецификации</div>
                <dl className="mt-4 space-y-3.5">
                  {project.specifications.map((s) => (
                    <div key={s.label} className="flex justify-between gap-4 border-b border-line pb-3 text-sm">
                      <dt className="eyebrow pt-0.5 text-ink/40">{s.label}</dt>
                      <dd className="text-right font-medium text-charcoal">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {project.href && (
                <Button href={project.href} variant="primary" className="w-full">
                  Истражи го проектот
                </Button>
              )}
              <Button href="/contact" variant="secondary" className="w-full">
                Контактирај за овој проект
              </Button>
            </aside>
          </Reveal>
        </div>
      </section>

      <OtherProjects currentProjectId={project.id} />
    </div>
  );
}
