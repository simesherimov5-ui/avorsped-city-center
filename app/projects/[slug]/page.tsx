import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { ChevronLeft } from "lucide-react";
import { projects } from "@/data";
import { Media } from "@/components/ui/Media";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";
import { RoomVideoTour } from "@/components/RoomVideoTour";
import { InteractiveFloorPlan } from "@/components/InteractiveFloorPlan";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectCta } from "@/components/project/ProjectCta";
import { Reveal } from "@/components/ui/Reveal";
import { ConstructionProgress } from "@/components/construction/ConstructionProgress";
import { FloorPickerSection } from "@/components/floor-picker/FloorPickerSection";
import { OtherProjects } from "@/components/OtherProjects";
import { projectStatusLabel } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Проект", robots: { index: false } };
  return pageMetadata({
    title: project.name,
    description: `${project.name}, ${project.location}. ${project.description}`,
    path: `/projects/${project.slug}`,
    image: null,
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  // A project with its own page (City Center → /development, Дојрански Рај → /dojran) has no second copy here: the
  // address permanently redirects to the main one, so each project has one page for search engines and sharing.
  if (project.href) permanentRedirect(project.href);

  const facts = [
    // the address is already the line above the name
    ...project.specifications.filter((spec) => spec.label !== "Локација"),
    { label: "Година", value: String(project.year) },
    { label: "Статус", value: project.statusLabelOverride ?? projectStatusLabel(project.status) },
  ];

  return (
    <div className="pt-24 sm:pt-28">
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8 lg:px-10">
        <Link
          href="/projects"
          className="focus-ring -ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-base text-muted hover:text-charcoal sm:text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Назад кон проектите
        </Link>
      </div>

      <section className="mx-auto max-w-6xl px-5 pb-12 pt-6 sm:px-8 lg:px-10">
        <Reveal immediate>
          {project.gallery.length > 0 ? (
            <PhotoCarousel
              photos={project.gallery}
              className={project.imageFit === "contain" ? "max-w-4xl" : undefined}
              sizes={project.imageFit === "contain" ? "(max-width: 896px) 55vw, 490px" : undefined}
              fit={project.imageFit}
              focus={project.imageFocus}
            />
          ) : (
            <Media
              image={project.heroImage}
              focus={project.imageFocus}
              label={`${project.name} — насловна визуелизација`}
              className="aspect-[16/7]"
              sizes="100vw"
            />
          )}
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 lg:px-10">
        <Reveal immediate delay={0.08}>
          <ProjectHeader
            eyebrow={project.location}
            name={project.name}
            description={project.description}
            facts={facts}
          />
        </Reveal>
      </section>

      {project.roomTour && (
        <Band
          title="Видео разгледување на просториите"
          note="Кликнете на просторија за да пуштите кратко видео разгледување."
        >
          <RoomVideoTour rooms={project.roomTour} />
        </Band>
      )}

      {project.floorPlanExplorer ? (
        <Band title="Распоред на просториите" note="Кликнете на број за да пуштите видео од таа просторија.">
          <InteractiveFloorPlan {...project.floorPlanExplorer} />
        </Band>
      ) : (
        project.apartmentTypes && (
          <Band title="Распоред на станови">
            <div className="grid gap-8 sm:grid-cols-2">
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
          </Band>
        )
      )}

      {project.floors && <FloorPickerSection floors={project.floors.map((floor) => ({ ...floor, apartments: [] }))} />}

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <ConstructionProgress project={project} always />
        </div>
      </section>

      <ProjectCta projectId={project.id} />

      <OtherProjects currentProjectId={project.id} />
    </div>
  );
}

/** One section of a project page: a rule, a heading in the display serif, an optional line under it, then the content. */
function Band({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <Reveal>
          <h2 className="font-display text-[clamp(22px,2.2vw,30px)] font-normal leading-[1.15]">{title}</h2>
          {note && <p className="mt-2 max-w-md text-sm text-muted">{note}</p>}
          <div className="mt-8 max-w-3xl">{children}</div>
        </Reveal>
      </div>
    </section>
  );
}
