import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { ProjectSlideshow } from "@/components/ProjectSlideshow";
import { Reveal } from "@/components/motion/Reveal";
import type { Project } from "@/types";

/**
 * "Во изградба сега": the company's current projects, in the same full-width slideshow as the Проекти page: one project
 * at a time with its status, name, place and a way in.
 */
export function NewProjects({ projects }: { projects: Project[] }) {
  return (
    <section id="new" className="section-y border-t border-on-chrome/10 bg-chrome text-on-chrome">
      <div className="container-x">
        <Reveal>
          <div className="sec-head">
            <div className="eyebrow text-accent">Ново · во продажба</div>
            <h2 className="t-h2">
              Во изградба <em className="italic text-accent">сега.</em>
            </h2>
            <Link
              href="/projects"
              className="sec-link focus-ring inline-flex min-h-11 items-center border-b border-accent pb-1 text-xs font-semibold uppercase tracking-[0.32em] text-accent"
            >
              Сите проекти →
            </Link>
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.1}>
        <div>
          <ProjectSlideshow projects={projects} headingAs="h3" autoplayMs={7000} />
        </div>
      </Reveal>
    </section>
  );
}
