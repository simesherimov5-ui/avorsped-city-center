import { Numbers, type NumberItem } from "@/components/home/Numbers";
import { ScrollToButton } from "@/components/project/ScrollToButton";
import { Reveal } from "@/components/ui/Reveal";
import { areaNumber } from "@/lib/format";
import type { Project } from "@/types";

/** 4 columns from 1024px, 2 × 2 below. */
const GRID = "grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 lg:grid-cols-4 lg:gap-12";

/**
 * «City Center во бројки»: the homepage's «Изградени на доверба» numbers (same look and count-up) for one project, from
 * its `stats`. A value the data does not have shows as a [bracket] (docs/content-needed.md). Only the whole numbers count
 * up; the range of the areas and the year are written as they are.
 */
export function ProjectNumbers({ project, scrollTarget }: { project: Project; scrollTarget: string }) {
  const s = project.stats ?? {};
  const whole = (value: number | undefined, label: string, missing: string): NumberItem =>
    value === undefined ? { text: missing, label } : { target: value, label };
  const items: NumberItem[] = [
    whole(s.buildings, "ЗГРАДИ", "[број]"),
    whole(s.apartments, "СТАНОВИ", "[број]"),
    {
      text:
        s.areaMin !== undefined && s.areaMax !== undefined
          ? `${areaNumber(s.areaMin)}–${areaNumber(s.areaMax)}`
          : "[од–до]",
      label: "M² ПОВРШИНИ",
    },
    s.moveInYear !== undefined
      ? { text: String(s.moveInYear), label: "ВСЕЛУВАЊЕ" }
      : { text: "[година]", label: "ВСЕЛУВАЊЕ" },
  ];

  return (
    <section
      aria-label={`${project.name} во бројки`}
      className="grain grain--dark border-t border-on-chrome/10 bg-chrome text-on-chrome"
    >
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-[70px] sm:px-8 sm:pb-24 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow text-accent">CITY CENTER</div>
              <h2 className="mt-3 font-display text-(length:--fs-h2) font-normal leading-[1.2]">
                City Center во бројки.
              </h2>
            </div>
            <ScrollToButton target={scrollTarget}>Изберете стан</ScrollToButton>
          </div>
        </Reveal>
        <div className="mt-12">
          <Numbers items={items} className={GRID} />
        </div>
      </div>
    </section>
  );
}
