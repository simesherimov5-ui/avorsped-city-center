import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { ProjectSlideshow } from "@/components/ProjectSlideshow";
import { Reveal } from "@/components/motion/Reveal";
import type { Project } from "@/types";

/**
 * "Сега во изградба": the company's current projects, in the same full-width slideshow as the Проекти page: one project
 * at a time with its name, place and a way in. Only projects with a photo are in it.
 */
export function NewProjects({ projects }: { projects: Project[] }) {
  // only projects with a photo are passed in (projectsWithPhoto); with none the section is not there
  if (projects.length === 0) return null;
  return (
    <section id="new" className="grain grain--dark bg-chrome text-on-chrome">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 className="font-display text-[length:calc(var(--fs-h2)*1.15)] font-normal leading-[1.2] text-balance">
                Сега во изградба.
              </h2>
            </div>
            <Link href="/projects" className="btn-tertiary focus-ring">
              Сите проекти →
            </Link>
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10">
          <ProjectSlideshow projects={projects} headingAs="h3" autoplayMs={7000} />
        </div>
      </Reveal>
    </section>
  );
}
