import { OtherProjectsSlideshow, type OtherSlide } from "@/components/project/OtherProjectsSlideshow";
import { projects } from "@/data";
import { projectStatusLabel } from "@/lib/format";
import { otherProjects, slidePhoto } from "@/lib/project-explorer";
import type { Project } from "@/types";

// no building box in the data yet (docs/content-needed.md): the whole photo is the box, so it is never cropped
const WHOLE = { x: 0, y: 0, w: 100, h: 100 };

function slideOf(p: Project): OtherSlide {
  const photo = slidePhoto(p);
  return {
    key: p.id,
    href: p.href ?? `/projects/${p.slug}`,
    name: p.name,
    eyebrow: `${p.city} · ${projectStatusLabel(p.status)}`,
    tagline: p.tagline,
    image: photo?.image ?? null,
    box: photo?.lead?.box ?? WHOLE,
    focus: photo?.lead?.focus,
    maxWidth: photo?.lead?.maxWidth,
  };
}

// A closing beat for any single-project experience (the generic project page, /development, /dojran): the other projects
// being built that have a photo, in one slideshow. With one project it has no controls; with none the section
// is not there.
export function OtherProjects({ currentProjectId }: { currentProjectId: string }) {
  const others = otherProjects(projects, currentProjectId);
  if (others.length === 0) return null;

  // On Оникс, with 28px (56px from 720px) of it above the frame so it never runs into a dark section above. The heading
  // and «Сите проекти →» are on the frame itself (OtherProjectsSlideshow).
  return (
    <section className="bg-chrome pb-16 pt-7 min-[720px]:pb-24 min-[720px]:pt-14">
      <OtherProjectsSlideshow slides={others.map(slideOf)} />
    </section>
  );
}
