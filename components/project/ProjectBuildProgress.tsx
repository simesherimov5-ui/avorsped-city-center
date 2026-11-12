import { Media } from "@/components/ui/Media";
import { NoPhoto } from "@/components/ui/NoPhoto";
import { Reveal } from "@/components/ui/Reveal";
import { CONSTRUCTION_PHASES } from "@/components/construction/phases";
import { realText } from "@/lib/format";
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
 * "Тек на градба" on the cream page: the heading and a line about the photos on the left, the date of the last update on
 * the right (only when the data has one), then the five phases on a thin line through their dots, Бронза up to the
 * current phase. Each phase: its dot (done Бронза, current gold with a soft pulse, still to come empty), its name, its
 * month (only when known) and a photo from the site (the no-photo mark while there is none). From 1024px the phases
 * stand side by side; under it they stack and the line runs down the left through the dots. The current phase is
 * `construction.currentPhase`, КОНСТРУКЦИЈА when the data does not say.
 */
export function ProjectBuildProgress({ project }: { project: Project }) {
  const progress = project.progress;
  if (!progress) return null;
  const currentKey = project.construction?.currentPhase ?? "structure";
  const current = Math.max(
    0,
    CONSTRUCTION_PHASES.findIndex((p) => p.key === currentKey)
  );
  const updated = realText(progress.updated ?? project.construction?.updated);
  const lede = realText(progress.lede);

  return (
    <section aria-label="Тек на градба" className="on-light grain border-t border-line">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-14 px-[5%] py-20 md:py-[120px]">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="eyebrow tracking-[0.32em] text-gold-deep">ТЕК НА ГРАДБА</div>
              <h2 className="m-0 font-display text-[length:calc(clamp(38px,4.4vw,62px)*var(--type-scale,1))] font-normal leading-[1.05] text-ink">
                {progress.title}
                {realText(progress.titleItalic) && <span className="text-gold-deep">{progress.titleItalic}</span>}
              </h2>
              {lede && <p className="m-0 text-base font-light leading-[1.8] text-ink/85">{lede}</p>}
            </div>
            {updated && (
              <div className="text-label uppercase tracking-[0.16em] text-gold-deep">
                Последно ажурирање · {formatUpdated(updated)}
              </div>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <ol className="tl m-0 list-none p-0">
            {CONSTRUCTION_PHASES.map((phase, i) => {
              const state = i < current ? "done" : i === current ? "current" : "upcoming";
              const detail = progress.phases?.[phase.key];
              const month = realText(detail?.date);
              return (
                <li
                  key={phase.key}
                  aria-current={state === "current" ? "step" : undefined}
                  // the stretch of line from this dot to the next one is Бронза up to the current phase
                  className={cn("tl-step", i < current && "is-passed")}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "tl-dot",
                      state === "done" && "bg-gold-deep",
                      state === "current" && "phase-pulse bg-gold",
                      state === "upcoming" && "bg-sand"
                    )}
                  />
                  <div
                    className={cn(
                      "text-label font-semibold uppercase tracking-[0.24em]",
                      state === "upcoming" ? "text-muted" : "text-ink"
                    )}
                  >
                    {NAMES[phase.key]}
                  </div>
                  {month && <div className="font-display text-lg text-gold-deep">{month}</div>}
                  <div className="h-[150px] w-full overflow-hidden">
                    {detail?.photo ? (
                      <Media
                        image={{ src: detail.photo.src, alt: detail.photo.alt, isPlaceholder: false }}
                        className="h-full w-full"
                        sizes="(max-width: 1023px) 90vw, 240px"
                      />
                    ) : (
                      <NoPhoto />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
