import { ProjectShowcase } from "@/components/ProjectShowcase";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { projects } from "@/data";

// A closing beat for any single-project experience (the generic project page,
// /development, /dojran): moves the visitor toward another development
// instead of ending at a dead end, without ever repeating the current one.
export function OtherProjects({ currentProjectId }: { currentProjectId: string }) {
  const others = projects.filter((p) => p.id !== currentProjectId);
  if (others.length === 0) return null;

  return (
    <section className="bg-chrome py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <SectionHeading eyebrow="Продолжете да истражувате" title="Другите наши проекти" tone="dark" />
        </Reveal>
      </div>
      <Reveal delay={0.1}>
        <div className="mx-auto mt-12 max-w-7xl px-6 lg:px-10">
          <ProjectShowcase projects={others} />
        </div>
      </Reveal>
    </section>
  );
}
