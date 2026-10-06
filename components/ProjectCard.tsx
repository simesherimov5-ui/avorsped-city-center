"use client";

import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import type { Project } from "@/types";
import { Media } from "@/components/ui/Media";
import { projectStatusLabel } from "@/lib/format";
import { ConstructionProgress } from "@/components/construction/ConstructionProgress";
import { cn } from "@/lib/cn";
import { spawnClickPulse } from "@/lib/clickPulse";
import { unitsText } from "@/lib/plural";

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
      className="focus-ring group relative isolate block border border-line bg-warm-white transition-colors duration-300 hover:border-ink/30"
    >
      <div className="relative overflow-hidden">
        <Media
          image={project.heroImage}
          label={`${project.name} — визуелизација`}
          fit={project.imageFit}
          focus={project.imageFocus}
          // a 2:1 photo in a 4:3 frame is drawn about 1.5x wider than the card, so the sizes allow for the crop
          sizes={
            project.imageFit === "contain"
              ? "(max-width: 640px) 80vw, 320px"
              : "(max-width: 640px) 150vw, (max-width: 1024px) 75vw, 50vw"
          }
          className="aspect-[4/3] transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
        />
        <span className={cn("eyebrow absolute left-3 top-3 px-2.5 py-1", STATUS_STYLE[project.status])}>
          {(() => {
            const statusText = project.statusLabelOverride ?? projectStatusLabel(project.status);
            return project.typeLabel ? `${project.typeLabel} · ${statusText}` : statusText;
          })()}
        </span>

        {hasHoverDetails && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-chrome/95 via-chrome/85 via-75% to-transparent px-4 pb-4 pt-14 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
            {project.tagline && <div className="text-sm text-on-chrome sm:text-base">{project.tagline}</div>}
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
        <div className="flex items-baseline justify-between gap-4">
          <div className="t-h3">{project.name}</div>
          <span
            aria-hidden
            className="shrink-0 text-bronze transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2"
          >
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M0 5h17M13 1l4 4-4 4" />
            </svg>
          </span>
        </div>
        <div className="relative mt-3 h-px bg-line">
          <i className="absolute left-0 top-0 h-px w-0 bg-bronze transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
        </div>
        <div className="mt-3 text-sm text-muted">{project.location}</div>
        <div className="mt-4 flex gap-4 border-t border-line pt-4 text-xs text-muted">
          <span>{project.year}</span>
          <span>{unitsText(project.units)}</span>
        </div>
        <ConstructionProgress project={project} variant="compact" className="mt-4 border-t border-line pt-4" />
      </div>
    </Link>
  );
}
