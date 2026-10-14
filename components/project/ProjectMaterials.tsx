import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectSection, SectionHead } from "@/components/project/SectionHead";
import type { Project } from "@/types";

/** "Материјали": what the project is built and finished with, in a responsive grid. A card without a photo shows the site's placeholder. */
export function ProjectMaterials({ project }: { project: Project }) {
  if (!project.materials?.length || !project.materialsHeading) return null;
  return (
    <ProjectSection label="Материјали" tone="dark">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHead eyebrow="МАТЕРИЈАЛИ" {...project.materialsHeading} className="max-w-2xl" />
          {project.equippedBy && (
            <div className="flex flex-col gap-1.5">
              <div className="eyebrow eyebrow-tight text-muted">ОПРЕМЕНО ОД</div>
              <div className="font-display text-xl text-ink">{project.equippedBy}</div>
            </div>
          )}
        </div>
      </Reveal>
      <Reveal delay={0.12}>
        <ul className="mt-12 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-6 p-0">
          {project.materials.map((item) => (
            <li key={item.name} className="group flex flex-col gap-4">
              <div className="aspect-[3/4] overflow-hidden bg-espresso">
                <Media
                  image={{ src: item.image?.src ?? "", alt: item.image?.alt ?? item.name, isPlaceholder: !item.image }}
                  label="[ ФОТОГРАФИЈА ]"
                  tone="dark"
                  className="h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, 320px"
                />
              </div>
              <div className="font-display text-(length:--fs-h3) text-ink">{item.name}</div>
              <p className="m-0 text-sm text-muted">{item.note}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </ProjectSection>
  );
}
