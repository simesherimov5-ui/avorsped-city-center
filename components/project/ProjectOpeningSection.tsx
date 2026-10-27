import { ProjectOpening } from "@/components/project/ProjectOpening";
import { ProjectAbout } from "@/components/project/ProjectAbout";
import { projectStatusLabel } from "@/lib/format";
import type { Project } from "@/types";

/** The photo opening of a project page and, when the project has the text, "За проектот" under it. Everything comes from the project's data. */
export function ProjectOpeningSection({
  project,
  aboutTarget,
}: {
  project: Project;
  /** The id of the section that «ИЗБЕРЕТЕ ЗГРАДА ↓» in "За проектот" leads to (the building picker). */
  aboutTarget?: string;
}) {
  const slides = (project.openingSlides ?? [{ image: project.heroImage }]).map((s, i) => ({
    key: `${i}-${s.image.src}`,
    image: s.image,
    focus: "focus" in s ? s.focus : undefined,
    maxWidth: "maxWidth" in s ? s.maxWidth : undefined,
    label: s.image.alt,
  }));
  const status = project.statusLabelOverride ?? projectStatusLabel(project.status);
  return (
    <>
      <ProjectOpening
        name={project.name}
        eyebrow={`${project.city} · ${status}`}
        tagline={project.openingTagline ?? project.tagline}
        slides={slides}
        storageKey={`hero-stopped-${project.slug}`}
      />
      {project.about && <ProjectAbout about={project.about} target={aboutTarget} />}
    </>
  );
}
