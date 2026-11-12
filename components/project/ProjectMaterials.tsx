import { Media } from "@/components/ui/Media";
import { NoPhoto } from "@/components/ui/NoPhoto";
import { Reveal } from "@/components/ui/Reveal";
import { realText } from "@/lib/format";
import type { Project } from "@/types";

/**
 * "Материјали" on the cream page: the heading on the left and who equipped the project on the right, then the materials
 * in a grid, each a 320px photo box (the site's no-photo mark while there is no photo) with its name and, when the data
 * has one, a note. On a screen with a mouse the photo slowly grows a little under the pointer; never with reduced motion.
 */
export function ProjectMaterials({ project }: { project: Project }) {
  if (!project.materials?.length || !project.materialsHeading) return null;
  const heading = project.materialsHeading;
  return (
    <section aria-label="Материјали" className="on-light grain">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-14 px-[5%] pb-[72px] pt-[88px] md:pb-[120px] md:pt-[140px]">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="flex flex-col gap-4">
              <div className="eyebrow tracking-[0.32em] text-gold-deep">МАТЕРИЈАЛИ</div>
              <h2 className="m-0 font-display text-[length:calc(clamp(38px,4.4vw,62px)*var(--type-scale,1))] font-normal leading-[1.05] text-ink">
                {heading.title}
                {realText(heading.titleItalic) && <span className="text-gold-deep">{heading.titleItalic}</span>}
              </h2>
            </div>
            {project.equippedBy && (
              <div className="flex flex-col gap-1.5 sm:text-right">
                <div className="text-label uppercase tracking-[0.28em] text-muted">Опремено од</div>
                <div className="font-display text-[length:calc(26px*var(--type-scale,1))] leading-tight text-ink">
                  {project.equippedBy}
                </div>
              </div>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-7 p-0">
            {project.materials.map((item) => (
              <li key={item.name} className="group flex flex-col gap-4">
                <div className="h-80 overflow-hidden">
                  <div className="h-full w-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.06] motion-reduce:group-hover:scale-100">
                    {item.image ? (
                      <Media
                        image={{ src: item.image.src, alt: item.image.alt, isPlaceholder: false }}
                        className="h-full w-full"
                        sizes="(max-width: 640px) 90vw, 320px"
                      />
                    ) : (
                      <NoPhoto />
                    )}
                  </div>
                </div>
                <div className="font-display text-[length:calc(26px*var(--type-scale,1))] leading-tight text-ink">
                  {item.name}
                </div>
                {realText(item.note) && (
                  <p className="m-0 text-[length:min(calc(13px*var(--type-scale,1)),var(--body-max,999px))] leading-[1.6] text-gold-deep">
                    {item.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
