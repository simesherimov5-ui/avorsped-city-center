import { ZoomNavLink } from "@/components/ui/ZoomTransition";
import { cn } from "@/lib/cn";
import type { Building, ConstructionPhase } from "@/types";

/** The five steps of a building, in order (the line and the labels under it). */
const STEPS: { key: ConstructionPhase; label: string }[] = [
  { key: "foundation", label: "Темели" },
  { key: "structure", label: "Конструкција" },
  { key: "facade", label: "Фасада" },
  { key: "interior", label: "Ентериер" },
  { key: "handover", label: "Вселување" },
];

const ROW_LABEL = "text-label font-semibold uppercase tracking-label text-muted";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The card of the building chosen in the picker: its name, its phase with the five-step line, the floors, the
 * apartments, the sizes and the year of moving in, and the way to its page. A value the data does not have shows as a
 * [bracket] (docs/content-needed.md). Nothing about what is for sale.
 */
export function BuildingCard({
  building,
  basePath,
  originRect,
  moveInYear,
}: {
  building: Building;
  basePath: string;
  originRect: Rect | null;
  /** The project's year of moving in, for a building that has none of its own. */
  moveInYear?: number;
}) {
  const current = STEPS.findIndex((s) => s.key === building.phase);
  const year = building.moveInYear ?? moveInYear;
  const rows: [string, string][] = [
    ["Катови", building.floorsLabel ?? "[катови]"],
    ["Станови", String(building.totalApartments)],
    ["Големини", building.areaRange ? `${building.areaRange.min}–${building.areaRange.max} м²` : "[од–до м²]"],
    ["Вселување", year !== undefined ? String(year) : "[година]"],
  ];

  return (
    <div className="flex flex-col gap-6 border border-line p-5 min-[420px]:p-6">
      <h3 className="m-0 font-display text-(length:--fs-h2) font-normal leading-[1.1]">{building.name}</h3>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <span className={ROW_LABEL}>Фаза</span>
          <span className="text-label font-semibold uppercase tracking-label text-bronze">
            {current >= 0 ? STEPS[current].label : "[фаза]"}
          </span>
        </div>
        <ol className="m-0 mt-3 flex list-none justify-between gap-1 p-0 min-[420px]:gap-1.5">
          {STEPS.map((step, i) => (
            <li
              key={step.key}
              aria-current={i === current ? "step" : undefined}
              className="flex flex-col items-center gap-2"
            >
              <span
                aria-hidden
                className={cn(
                  "block h-[3px] w-full",
                  i < current ? "bg-ink" : i === current ? "bg-bronze" : "bg-ink/15"
                )}
              />
              <span
                className={cn(
                  "whitespace-nowrap text-[0.625rem] leading-none",
                  i < current ? "text-ink" : i === current ? "font-semibold text-bronze" : "text-muted"
                )}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <dl className="m-0 flex flex-col border-t border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
            <dt className={ROW_LABEL}>{label}</dt>
            <dd className="m-0 text-right text-base text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <ZoomNavLink
        href={`${basePath}/${building.id}`}
        label={building.name}
        originRect={originRect ? () => originRect : undefined}
        className="btn-secondary focus-ring w-full"
        data-tone="light"
      >
        Разгледајте ја зградата →
      </ZoomNavLink>
    </div>
  );
}
