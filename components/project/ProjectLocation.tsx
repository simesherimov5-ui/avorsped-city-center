import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectSection, SectionHead } from "@/components/project/SectionHead";
import type { Project } from "@/types";

/**
 * "Локација": on the left the places near the project and how long it takes to walk there, one row each under a thin
 * line; on the right the location map the page brings (`map`), with its link underneath. `below` is for text the page
 * keeps under the two columns.
 */
export function ProjectLocation({ project, map, below }: { project: Project; map?: ReactNode; below?: ReactNode }) {
  const walking = project.walking;
  if (!walking) return null;
  return (
    <ProjectSection label="Локација">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHead eyebrow="ЛОКАЦИЈА" title={walking.title} titleItalic={walking.titleItalic} />
          <ul className="mt-10 list-none p-0">
            {walking.places.map((place) => (
              <li key={place.name} className="flex items-baseline justify-between gap-4 border-b border-line py-4">
                <span className="font-display text-(length:--fs-h3) text-ink">{place.name}</span>
                <span className="eyebrow eyebrow-tight shrink-0 text-muted">{place.time}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        {map && <Reveal delay={0.12}>{map}</Reveal>}
      </div>
      {below}
    </ProjectSection>
  );
}
