import { ProjectSlideshow } from "@/components/ProjectSlideshow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { projects } from "@/data";
import { carouselProjects } from "@/lib/project-explorer";

// A closing beat for any single-project experience (the generic project page, /development, /dojran): the same
// carousel as Почетна's «Сега во изградба», with the projects being built (carouselProjects), never the current one.
// With one project it has no controls; with none the section is not there.
export function OtherProjects({
  currentProjectId,
  light = false,
}: {
  currentProjectId: string;
  /** The cream ground with dark text for the heading, instead of Оникс. */
  light?: boolean;
}) {
  const others = carouselProjects(projects).filter((p) => p.id !== currentProjectId);
  if (others.length === 0) return null;

  return (
    <section className={`${light ? "on-light" : "bg-chrome"} py-16 sm:py-24`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Продолжете да истражувате"
            title="Другите наши проекти"
            tone={light ? "light" : "dark"}
          />
        </Reveal>
      </div>
      <Reveal delay={0.1}>
        <div className="mt-12">
          <ProjectSlideshow projects={others} headingAs="h3" autoplayMs={7000} />
        </div>
      </Reveal>
    </section>
  );
}
