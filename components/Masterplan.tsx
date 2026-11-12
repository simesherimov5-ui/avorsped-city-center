"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { DURATION, EASE } from "@/lib/motion";
import type { Building, MediaImage } from "@/types";
import { BuildingCard } from "@/components/project/BuildingCard";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/cn";
import { floorsText, unitsText } from "@/lib/plural";

const STATUS_LABEL: Record<string, string> = {
  planning: "Планирање",
  foundation: "Темели",
  structure: "Конструкција",
  exterior: "Фасада",
  interior: "Завршни работи",
  completed: "Завршено",
};

interface MasterplanProps {
  /** The buildings to plot — any project with more than one building can pass its own. */
  buildings: Building[];
  /** The aerial/site-plan photo the hotspots are positioned over. */
  image: MediaImage;
  /** Marker position per building.id, as percentages of `image`. */
  hotspots: Record<string, { top: string; left: string }>;
  /** Route prefix a building detail page lives under, e.g. "/development". */
  basePath: string;
  className?: string;
  /** Where north is on `image`, in degrees (0 = up, clockwise). Without it the photo has no compass. */
  north?: number;
  /** The year of moving in of the project, for a building that has none of its own. */
  moveInYear?: number;
  /** Shown directly under the building card (the project's gallery button), whichever building is chosen. */
  afterCard?: ReactNode;
}

/**
 * The building picker: the aerial photo with a marker on every building, a row of the building numbers under it
 * (the chosen one filled) and, beside it (under it on a phone), the card of the chosen building. The first building is
 * chosen at the start; a marker or a number changes it. The photo keeps its own 16:9 box whatever the card beside it does
 * (stretching it would crop the photo and slide the markers off their buildings).
 */
export function Masterplan({
  buildings,
  image,
  hotspots,
  basePath,
  className,
  north,
  moveInYear,
  afterCard,
}: MasterplanProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(buildings[0]?.id ?? null);

  const active = buildings.find((b) => b.id === selected) ?? buildings[0];
  const choose = (id: string) => setSelected(id);

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6">
      <div className="min-w-0">
        {/* Real aerial photo with selectable hotspots per building */}
        <div className={cn("relative aspect-[16/9] w-full overflow-hidden border border-line", className)}>
          <div className="absolute inset-0">
            <Media image={image} className="h-full w-full" sizes="(max-width: 1280px) 100vw, 836px" />
          </div>

          {north !== undefined && <Compass north={north} />}

          {buildings.map((building) => {
            const spot = hotspots[building.id];
            if (!spot) return null;

            const isHovered = hovered === building.id;
            const isSelected = active?.id === building.id;
            const isDimmed = !isSelected && !isHovered;

            return (
              <button
                type="button"
                key={building.id}
                onMouseEnter={() => setHovered(building.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(building.id)}
                onBlur={() => setHovered(null)}
                onClick={() => choose(building.id)}
                aria-pressed={isSelected}
                aria-label={`${building.name} — детали`}
                className="focus-ring group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center active:scale-90"
                style={spot}
              >
                <motion.div
                  animate={{
                    scale: isSelected ? 1.25 : isHovered ? 1.15 : 1,
                    opacity: isDimmed ? 0.45 : 1,
                  }}
                  transition={{ duration: DURATION.base, ease: EASE }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold sm:h-9 sm:w-9 sm:text-sm",
                    (isSelected || isHovered) && "outline outline-1 outline-offset-4 outline-accent/50",
                    isSelected
                      ? "border-accent bg-accent text-chrome"
                      : isHovered
                        ? "border-accent bg-accent/25 text-chrome"
                        : "border-on-chrome/50 bg-chrome/85 text-on-chrome"
                  )}
                >
                  {building.shortLabel}
                </motion.div>

                {/* Quick hover preview — independent of the chosen building's card */}
                <motion.div
                  initial={false}
                  animate={{
                    opacity: isHovered && !isSelected ? 1 : 0,
                    y: isHovered && !isSelected ? 0 : 6,
                  }}
                  className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 w-44 -translate-x-1/2 border border-on-chrome/10 bg-chrome p-3.5 text-left text-on-chrome"
                >
                  <div className="text-base font-medium">{building.name}</div>
                  <div className="mt-2 space-y-1 text-label text-on-chrome/70">
                    <div>
                      {building.floorsLabel ?? floorsText(building.floors.length)} ·{" "}
                      {unitsText(building.totalApartments)}
                    </div>
                    <div>{STATUS_LABEL[building.status]}</div>
                  </div>
                </motion.div>
              </button>
            );
          })}
        </div>

        {/* The building numbers, the chosen one filled */}
        <div role="group" aria-label="Згради" className="mt-4 flex flex-wrap gap-2">
          {buildings.map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={b.id === active?.id}
              aria-label={b.name}
              onClick={() => choose(b.id)}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "focus-ring flex h-11 w-12 items-center justify-center border text-base font-medium transition-colors",
                b.id === active?.id ? "border-onyx bg-onyx text-travertine" : "border-line text-ink hover:border-ink/40"
              )}
            >
              {b.shortLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        {active && <BuildingCard building={active} basePath={basePath} moveInYear={moveInYear} />}
        {/* under the card, whichever building is chosen: it is about the whole complex */}
        {afterCard}
      </div>
    </div>
  );
}

/**
 * A compass in the top-right corner of the photo: a thin ring, a slim diamond needle and the letter С (север) above it,
 * in the accent colour on a soft dark backing so it reads on the bright parts of the photo. The whole compass turns by
 * `north` degrees, so the needle points to north on the photo. It is decoration only and sits under the markers.
 */
export function Compass({ north }: { north: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 72 72"
      className="pointer-events-none absolute right-0 top-0 h-[58px] w-[58px] sm:h-[72px] sm:w-[72px]"
    >
      <g transform={`rotate(${north} 36 36)`}>
        <circle cx="36" cy="36" r="26" fill="var(--color-onyx)" fillOpacity="0.45" />
        <circle cx="36" cy="36" r="20" fill="none" stroke="var(--color-gold)" strokeWidth="1.25" />
        <path
          d="M36 18 L39 36 L36 54 L33 36 Z"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path d="M36 18 L39 36 L33 36 Z" fill="var(--color-gold)" />
        <text
          x="36"
          y="13"
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="var(--color-gold)"
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
        >
          С
        </text>
      </g>
    </svg>
  );
}
