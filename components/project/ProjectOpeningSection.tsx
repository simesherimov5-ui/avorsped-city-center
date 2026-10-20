import { ProjectOpening } from "@/components/project/ProjectOpening";
import { ProjectAbout } from "@/components/project/ProjectAbout";
import { projectStatusLabel } from "@/lib/format";
import type { Project } from "@/types";

/** The cinematic opening of a project page and, when the project has the text, "За проектот" under it. Everything comes from the project's data. */
export function ProjectOpeningSection({ project }: { project: Project }) {
  const status = project.statusLabelOverride ?? projectStatusLabel(project.status);
  return (
    <>
      <ProjectOpening
        name={project.name}
        eyebrow={`${project.city} · ${status}`}
        tagline={project.openingTagline ?? project.tagline}
        image={project.heroImage}
        film={project.heroFilm}
      />
      {project.about && (
        <div className="on-light">
          <ProjectAbout about={project.about} />
        </div>
      )}
    </>
  );
}
