import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { ProjectSlideshow } from "@/components/ProjectSlideshow";
import { Reveal } from "@/components/motion/Reveal";
import type { Project } from "@/types";

/**
 * "Сега во изградба": the company's current projects, in the same full-width slideshow as the Проекти page: one project
 * at a time with its status, name, place and a way in.
 */
export function NewProjects({ projects }: { projects: Project[] }) {
  return (
    <section id="new" className="grain grain--dark bg-chrome text-on-chrome">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <span aria-hidden className="block h-2 w-2 rounded-full bg-accent" />
                <div className="eyebrow text-accent">Ново · во продажба</div>
              </div>
              <h2 className="mt-3 font-display text-(length:--fs-h2) font-normal leading-[1.2]">Сега во изградба.</h2>
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
