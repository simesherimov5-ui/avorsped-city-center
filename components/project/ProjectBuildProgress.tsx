import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { CONSTRUCTION_PHASES } from "@/components/construction/phases";
import { ProjectSection, SectionHead } from "@/components/project/SectionHead";
import { cn } from "@/lib/cn";
import type { Project } from "@/types";

// The names this section gives the five phases (the shared list is used by other pages and says "Предавање").
const NAMES: Record<string, string> = {
  foundation: "ТЕМЕЛИ",
  structure: "КОНСТРУКЦИЈА",
  facade: "ФАСАДА",
  interior: "ЕНТЕРИЕР",
  handover: "ВСЕЛУВАЊЕ",
};

function formatUpdated(value: string) {
  const [y, m, d] = value.split("-");
  return y && m && d && /^\d{4}$/.test(y) ? `${d}.${m}.${y}` : value;
}

/**
 * "Тек на градба": five phases side by side on a thin timeline that is filled up to the current phase. Each has a dot
 * (done, current with a soft pulse, or still to come), its name, its month and a photo from the site (or the site's
 * placeholder). The current phase is `construction.currentPhase`, КОНСТРУКЦИЈА when the data does not say.
 */
export function ProjectBuildProgress({ project }: { project: Project }) {
  const progress = project.progress;
  if (!progress) return null;
  const currentKey = project.construction?.currentPhase ?? "structure";
  const current = Math.max(
    0,
    CONSTRUCTION_PHASES.findIndex((p) => p.key === currentKey)
  );
  const updated = progress.updated ?? project.construction?.updated;
  const fill = (current / (CONSTRUCTION_PHASES.length - 1)) * 100;

  return (
    <ProjectSection label="Тек на градба" tone="tint">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow="ТЕК НА ГРАДБА" title={progress.title} titleItalic={progress.titleItalic} />
          <div className="eyebrow eyebrow-tight text-muted">
            ПОСЛЕДНО АЖУРИРАЊЕ · {updated ? formatUpdated(updated) : "[датум]"}
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.12}>
        <ol className="relative mt-14 grid list-none gap-10 p-0 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {/* the thin timeline behind the dots (wide screens), filled up to the current phase */}
          <span aria-hidden className="absolute left-[10%] right-[10%] top-[5px] hidden h-px bg-line lg:block">
            <span className="absolute inset-y-0 left-0 bg-gold-deep" style={{ width: `${fill}%` }} />
          </span>
          {CONSTRUCTION_PHASES.map((phase, i) => {
            const state = i < current ? "done" : i === current ? "current" : "upcoming";
            const detail = progress.phases?.[phase.key];
            return (
              <li
                key={phase.key}
                aria-current={state === "current" ? "step" : undefined}
                className="relative flex flex-col items-center gap-3 text-center"
              >
                <span
                  aria-hidden
                  className={cn(
                    "relative z-10 block h-[11px] w-[11px] rounded-full",
                    state === "done" && "bg-gold-deep",
                    state === "current" && "phase-pulse bg-gold-deep",
                    state === "upcoming" && "border border-ink/40 bg-transparent"
                  )}
                />
                <div className="eyebrow eyebrow-tight text-ink">{NAMES[phase.key]}</div>
                <div className="font-display text-base italic text-gold-deep">{detail?.date ?? "[месец]"}</div>
                <div className="mt-2 aspect-[4/3] w-full overflow-hidden bg-ink/10">
                  <Media
                    image={{
                      src: detail?.photo?.src ?? "",
                      alt: detail?.photo?.alt ?? NAMES[phase.key],
                      isPlaceholder: !detail?.photo,
                    }}
                    label="[ ФОТО ОД ГРАДИЛИШТЕ ]"
                    tone="light"
                    className="h-full w-full"
                    sizes="(max-width: 640px) 100vw, 260px"
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </Reveal>
    </ProjectSection>
  );
}
