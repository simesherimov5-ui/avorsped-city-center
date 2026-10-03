"use client";

import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import type { Project } from "@/types";
import { Media } from "@/components/ui/Media";
import { projectStatusLabel } from "@/lib/format";
import { ConstructionProgress } from "@/components/construction/ConstructionProgress";
import { cn } from "@/lib/cn";
import { spawnClickPulse } from "@/lib/clickPulse";

// Never color-code project phase — "completed" is distinguished by shape
// (a bordered pill) rather than a hue that would break the 3-color palette.
const STATUS_STYLE: Record<Project["status"], string> = {
  completed: "border border-gold bg-paper text-ink",
  "under-construction": "bg-accent text-chrome",
  upcoming: "bg-chrome text-on-chrome",
};

export function ProjectCard({ project }: { project: Project }) {
  const hasHoverDetails = Boolean(project.tagline || project.distanceHighlights?.length);

  return (
    <Link
      href={project.href ?? `/projects/${project.slug}`}
      onPointerDown={spawnClickPulse}
      className="focus-ring group relative isolate block border border-line bg-warm-white transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(27,26,24,0.35)]"
    >
      <div className="relative overflow-hidden">
        <Media
          image={project.heroImage}
          label={`${project.name} — визуелизација`}
          fit={project.imageFit}
          focus={project.imageFocus}
          className="aspect-[4/3] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className={cn("eyebrow absolute left-3 top-3 px-2.5 py-1", STATUS_STYLE[project.status])}>
          {(() => {
            const statusText = project.statusLabelOverride ?? projectStatusLabel(project.status);
            return project.typeLabel ? `${project.typeLabel} · ${statusText}` : statusText;
          })()}
        </span>

        {hasHoverDetails && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-chrome/90 via-chrome/55 to-transparent p-4 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
            {project.tagline && (
              <div className="font-display text-sm text-on-chrome sm:text-base">{project.tagline}</div>
            )}
            {project.distanceHighlights && project.distanceHighlights.length > 0 && (
              <ul className="mt-1.5 space-y-0.5 text-[11px] uppercase tracking-wide text-on-chrome/80">
                {project.distanceHighlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="border-t border-line p-6">
        <div className="font-display text-xl">{project.name}</div>
        <div className="mt-1.5 text-sm text-ink/50">{project.location}</div>
        <div className="mt-4 flex gap-4 border-t border-line pt-4 text-xs text-ink/60">
          <span>{project.year}</span>
          <span>{project.units} станови</span>
        </div>
        <ConstructionProgress project={project} variant="compact" className="mt-4 border-t border-line pt-4" />
      </div>
    </Link>
  );
}
