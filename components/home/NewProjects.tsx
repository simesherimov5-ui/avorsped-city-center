import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { Reveal } from "@/components/motion/Reveal";
import type { Project } from "@/types";

/**
 * "Во изградба сега": the projects being built now, one large photo after another (the same slideshow the homepage
 * has always used), each with its status, name and place, and a way in.
 */
export function NewProjects({ projects }: { projects: Project[] }) {
  return (
    <section id="new" className="bg-chrome text-on-chrome">
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <span aria-hidden className="block h-2 w-2 rounded-full bg-accent" />
                <div className="eyebrow text-accent">Ново · во продажба</div>
              </div>
              <h2 className="mt-3 font-display text-[clamp(26px,2.8vw,40px)] font-normal leading-[1.1]">
                Во изградба <em className="italic text-accent">сега.</em>
              </h2>
            </div>
            <Link
              href="/projects"
              className="focus-ring inline-flex min-h-11 items-center border-b border-accent pb-1 text-xs font-semibold uppercase tracking-[0.32em] text-accent"
            >
              Сите проекти →
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10">
            <ProjectShowcase projects={projects} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
