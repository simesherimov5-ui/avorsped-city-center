import Link from "next/link";
import type { Project } from "@/types";
import { Media } from "@/components/ui/Media";
import { projectStatusLabel } from "@/lib/format";
import { cn } from "@/lib/cn";

const STATUS_STYLE: Record<Project["status"], string> = {
  completed: "bg-emerald-700 text-warm-white",
  "under-construction": "bg-accent text-charcoal",
  upcoming: "bg-ink text-warm-white",
};

export function ProjectCard({ project }: { project: Project }) {
  const hasHoverDetails = Boolean(project.tagline || project.distanceHighlights?.length);

  return (
    <Link
      href={project.href ?? `/projects/${project.slug}`}
      className="focus-ring group block border border-line bg-warm-white transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(27,26,24,0.35)]"
    >
      <div className="relative overflow-hidden">
        <Media
          image={project.heroImage}
          label={`${project.name} — визуелизација`}
          fit={project.imageFit}
          className="aspect-[4/3] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className={cn("eyebrow absolute left-3 top-3 px-2.5 py-1", STATUS_STYLE[project.status])}>
          {(() => {
            const statusText = project.statusLabelOverride ?? projectStatusLabel(project.status);
            return project.typeLabel ? `${project.typeLabel} · ${statusText}` : statusText;
          })()}
        </span>

        {hasHoverDetails && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-charcoal/90 via-charcoal/55 to-transparent p-4 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            {project.tagline && (
              <div className="font-display text-sm text-warm-white sm:text-base">{project.tagline}</div>
            )}
            {project.distanceHighlights && project.distanceHighlights.length > 0 && (
              <ul className="mt-1.5 space-y-0.5 text-[11px] uppercase tracking-wide text-warm-white/80">
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
      </div>
    </Link>
  );
}
