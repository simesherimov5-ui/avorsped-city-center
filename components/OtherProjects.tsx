import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { OtherProjectsSlideshow, type OtherSlide } from "@/components/project/OtherProjectsSlideshow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { projects } from "@/data";
import { projectStatusLabel } from "@/lib/format";
import { otherProjects } from "@/lib/project-explorer";
import type { Project } from "@/types";

// no building box in the data yet (docs/content-needed.md): the whole photo is the box, so it is never cropped
const WHOLE = { x: 0, y: 0, w: 100, h: 100 };

function slideOf(p: Project): OtherSlide {
  const lead = p.layout === "photo-led" ? p.openingSlides[0] : undefined;
  const image = lead?.image ?? p.heroImage;
  const hasPhoto = !image.isPlaceholder && image.src !== "";
  return {
    key: p.id,
    href: p.href ?? `/projects/${p.slug}`,
    name: p.name,
    eyebrow: `${p.city} · ${projectStatusLabel(p.status)}`,
    tagline: p.tagline,
    image: hasPhoto ? image : null,
    box: lead?.box ?? WHOLE,
    focus: lead?.focus,
    maxWidth: lead?.maxWidth,
  };
}

// A closing beat for any single-project experience (the generic project page, /development, /dojran): every other
// project in one slideshow, the ones being built first. With one project it has no controls; with none the section is
// not there.
export function OtherProjects({
  currentProjectId,
  light = false,
}: {
  currentProjectId: string;
  /** The cream ground with dark text for the heading, instead of Оникс. */
  light?: boolean;
}) {
  const others = otherProjects(projects, currentProjectId);
  if (others.length === 0) return null;

  return (
    <section className={`${light ? "on-light" : "bg-chrome"} py-16 sm:py-24`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <SectionHeading eyebrow="JAVOR SPED HOLDING" title="Другите наши проекти" tone={light ? "light" : "dark"} />
            <Link href="/projects" data-tone={light ? "light" : undefined} className="btn-tertiary focus-ring">
              Сите проекти →
            </Link>
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10 sm:mt-12">
          <OtherProjectsSlideshow slides={others.map(slideOf)} light={light} />
        </div>
      </Reveal>
    </section>
  );
}
