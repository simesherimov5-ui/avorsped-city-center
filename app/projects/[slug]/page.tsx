import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { ChevronLeft } from "lucide-react";
import { apartmentsOf, projects } from "@/data";
import { Media } from "@/components/ui/Media";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";
import { RoomVideoTour } from "@/components/RoomVideoTour";
import { OneVideoAtATime } from "@/components/ui/OneVideoAtATime";
import { InteractiveFloorPlan } from "@/components/InteractiveFloorPlan";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectCta } from "@/components/project/ProjectCta";
import { ProjectOpeningSection } from "@/components/project/ProjectOpeningSection";
import { ProjectMaterials } from "@/components/project/ProjectMaterials";
import { ProjectParking } from "@/components/project/ProjectParking";
import { ProjectLocation } from "@/components/project/ProjectLocation";
import { ProjectBuildProgress } from "@/components/project/ProjectBuildProgress";
import { ProjectBook } from "@/components/project/ProjectBook";
import { Reveal } from "@/components/ui/Reveal";
import { ConstructionProgress } from "@/components/construction/ConstructionProgress";
import { FloorPickerSection } from "@/components/floor-picker/FloorPickerSection";
import { OtherProjects } from "@/components/OtherProjects";
import { projectStatusLabel } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { NoPhoto } from "@/components/ui/NoPhoto";
import { ProjectHeroSlideshow } from "@/components/project/ProjectHeroSlideshow";
import { ProjectIntroFacts } from "@/components/project/ProjectIntroFacts";
import { ProjectGallery } from "@/components/project/ProjectGallery";
import { ProjectPlace } from "@/components/project/ProjectPlace";
import { ObjectPicker } from "@/components/project/ObjectPicker";
import type { PhotoLedProject, Project } from "@/types";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Проект", robots: { index: false } };
  if (project.layout === "photo-led")
    return pageMetadata({
      title: project.name,
      description: `${project.name}, ${project.city}: ${(project.facts ?? []).map((f) => `${f.value} ${f.label.toLowerCase()}`).join(", ")}. ${projectStatusLabel(project.status)}.`,
      path: `/projects/${project.slug}`,
      image: null,
    });
  if (project.stub)
    return pageMetadata({
      title: project.name,
      description: `${project.name}, ${project.city}. ${projectStatusLabel(project.status)}.`,
      path: `/projects/${project.slug}`,
      image: null,
    });
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
  if (project.stub) return <StubProjectPage project={project} />;
  if (project.layout === "photo-led") return <PhotoLedProjectPage project={project} />;

  const completed = project.status === "completed";
  const hasPhotos = project.gallery.length > 0 || !project.heroImage.isPlaceholder;
  const facts = [
    ...(project.typeLabel ? [{ label: "Тип", value: project.typeLabel }] : []),
    // the address is already the line above the name
    ...project.specifications.filter((spec) => spec.label !== "Локација"),
    ...(project.year ? [{ label: "Година", value: String(project.year) }] : []),
    { label: "Статус", value: project.statusLabelOverride ?? projectStatusLabel(project.status) },
  ];

  return (
    <div className={project.heroOpening ? undefined : "pt-24 sm:pt-28"}>
      {project.heroOpening && (
        <>
          <ProjectOpeningSection project={project} />
          <ProjectMaterials project={project} />
          <ProjectParking project={project} />
          <ProjectBuildProgress project={project} />
          <ProjectLocation project={project} />
          <ProjectBook project={project} />
        </>
      )}
      {!project.heroOpening && (
        <>
          <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8 lg:px-10">
            <Link
              href="/projects"
              className="focus-ring -ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-base text-muted hover:text-charcoal sm:text-sm"
            >
              <ChevronLeft className="h-4 w-4" /> Назад кон проектите
            </Link>
          </div>

          {hasPhotos && (
            <section className="mx-auto max-w-6xl px-5 pb-12 pt-6 sm:px-8 lg:px-10">
              <Reveal immediate>
                {project.gallery.length > 0 ? (
                  <PhotoCarousel
                    photos={project.gallery}
                    // 16:9, up to 896px wide (a square photo in it is shown whole, see Media)
                    className="max-w-4xl"
                    sizes="(max-width: 896px) 100vw, 896px"
                    fit={project.imageFit}
                    focus={project.imageFocus}
                  />
                ) : (
                  <Media
                    image={project.heroImage}
                    focus={project.imageFocus}
                    label={`${project.name} — насловна визуелизација`}
                    className="aspect-[16/7]"
                    priority
                    sizes="(max-width: 1152px) 100vw, 1152px"
                  />
                )}
              </Reveal>
              {project.photoCredit && (
                <p className="mt-4 text-[12px] leading-relaxed text-muted">
                  {project.photoCredit.map((part, i) =>
                    part.href ? (
                      <a
                        key={i}
                        href={part.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-gold decoration-2 underline-offset-2 hover:text-charcoal"
                      >
                        {part.text}
                      </a>
                    ) : (
                      <span key={i}>{part.text}</span>
                    )
                  )}
                </p>
              )}
            </section>
          )}

          <section className={`mx-auto max-w-6xl px-5 pb-14 sm:px-8 lg:px-10 ${hasPhotos ? "" : "pt-10"}`}>
            <Reveal immediate delay={0.08}>
              <ProjectHeader
                eyebrow={project.location}
                name={project.name}
                description={project.description}
                facts={facts}
              />
            </Reveal>
          </section>
        </>
      )}

      {(project.roomTour || project.floorPlanExplorer) && <OneVideoAtATime />}

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

      {project.floors && (
        <FloorPickerSection
          floors={project.floors.map((floor) => ({
            ...floor,
            apartments: apartmentsOf(project.id)
              .filter((a) => a.floor === floor.number)
              .map((a) => ({ id: a.id, number: a.number, area: a.area, bedrooms: a.bedrooms })),
          }))}
        />
      )}

      {!completed && (
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <ConstructionProgress project={project} always />
          </div>
        </section>
      )}

      {completed ? (
        <ProjectCta projectId={project.id} label="Закажи консултација" href="/contact" />
      ) : (
        <ProjectCta projectId={project.id} />
      )}

      <OtherProjects currentProjectId={project.id} />
    </div>
  );
}

/**
 * A photo-led project page: the photo slideshow on Оникс under a clear header, «ЗА ПРОЕКТОТ» with the facts, the
 * gallery, the location, the invitation and the other projects. Only what the data has is shown (no phases, floors or
 * units until they are known).
 */
function PhotoLedProjectPage({ project }: { project: PhotoLedProject }) {
  const status = projectStatusLabel(project.status);
  return (
    <div>
      <ProjectHeroSlideshow
        name={project.name}
        eyebrow={`${project.city} · ${status}`}
        slides={project.openingSlides}
      />
      {project.intro && (
        <ProjectIntroFacts
          heading={project.intro}
          facts={[...(project.facts ?? []), { label: "Град", value: project.city }, { label: "Статус", value: status }]}
          link={
            project.objects && project.sitePlan ? { target: "izberete-objekt", label: "Изберете објект ↓" } : undefined
          }
        />
      )}
      {project.objects && project.sitePlan && (
        <section
          id="izberete-objekt"
          aria-label="Изберете објект"
          className="on-light grain scroll-mt-(--nav-h) border-t border-line"
        >
          <div className="mx-auto max-w-[1320px] px-[5%] py-16 md:py-24">
            <div className="eyebrow tracking-[0.32em] text-gold-deep">КОМПЛЕКСОТ</div>
            <h2 className="m-0 mt-4 font-display text-[clamp(40px,4.8vw,72px)] font-normal leading-[1.05] text-ink">
              Изберете објект.
            </h2>
            <p className="m-0 mt-4 text-base text-muted">Изберете објект од планот.</p>
            <div className="mt-12">
              <ObjectPicker projectName={project.name} objects={project.objects} plan={project.sitePlan} />
            </div>
          </div>
        </section>
      )}
      {project.gallery.length > 0 && <ProjectGallery photos={project.gallery} />}
      {project.place && <ProjectPlace name={project.name} city={project.city} place={project.place} />}
      <ProjectCta projectId={project.id} />
      <OtherProjects currentProjectId={project.id} />
    </div>
  );
}

/**
 * The page of a project known only by its name, city and status (`stub`): the way back, the photo frame with the logo
 * mark, the city and status and the name. Being built: one line and the contact invitation. Finished: the year, if known.
 * Nothing about apartments, floors or availability; it ends with «Другите наши проекти». To be redesigned once the
 * project's photos and text arrive.
 */
function StubProjectPage({ project }: { project: Project }) {
  const completed = project.status === "completed";
  return (
    <div className="pt-24 sm:pt-28">
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8 lg:px-10">
        <Link
          href={completed ? "/completed-projects" : "/projects"}
          className="focus-ring -ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-base text-muted hover:text-charcoal sm:text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> {completed ? "Назад кон завршените проекти" : "Назад кон проектите"}
        </Link>
      </div>

      <section className="mx-auto max-w-6xl px-5 pb-14 pt-6 sm:px-8 lg:px-10">
        <div className="aspect-[16/7] max-sm:aspect-[4/3]">
          <NoPhoto />
        </div>
        <ProjectHeader
          className="mt-10"
          eyebrow={`${project.city} · ${projectStatusLabel(project.status)}`}
          name={project.name}
          facts={[]}
        />
        {!completed && <p className="mt-5 text-base leading-[1.75] text-ink/75">Деталите следуваат наскоро.</p>}
        {completed && project.year && (
          <p className="mt-5 text-base leading-[1.75] text-ink/75">Година: {project.year}</p>
        )}
      </section>

      {!completed && <ProjectCta projectId={project.id} href="/contact" />}

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
          <h2 className="font-display text-(length:--fs-h2) font-normal leading-[1.15]">{title}</h2>
          {note && <p className="mt-2 max-w-md text-sm text-muted">{note}</p>}
          <div className="mt-8 max-w-3xl">{children}</div>
        </Reveal>
      </div>
    </section>
  );
}
