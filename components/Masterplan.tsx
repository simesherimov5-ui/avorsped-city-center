"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { DURATION, EASE } from "@/lib/motion";
import type { Apartment, Building, MediaImage } from "@/types";
import { Media } from "@/components/ui/Media";
import { ZoomNavLink } from "@/components/ui/ZoomTransition";
import { cn } from "@/lib/cn";
import { availableWord, floorsText, unitsText } from "@/lib/plural";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function rectOf(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}

const STATUS_LABEL: Record<string, string> = {
  planning: "Планирање",
  foundation: "Темели",
  structure: "Конструкција",
  exterior: "Фасада",
  interior: "Внатрешно доуредување",
  completed: "Завршено",
};

interface MasterplanProps {
  /** The buildings to plot — any project with more than one building can pass its own. */
  buildings: Building[];
  /** Used to compute each building's live availability count. */
  apartments: Apartment[];
  /** The aerial/site-plan photo the hotspots are positioned over. */
  image: MediaImage;
  /** Marker position per building.id, as percentages of `image`. */
  hotspots: Record<string, { top: string; left: string }>;
  /** Route prefix a building detail page lives under, e.g. "/development". */
  basePath: string;
  variant?: "preview" | "full";
  className?: string;
  /** Where north is on `image`, in degrees (0 = up, clockwise). Without it the photo has no compass. */
  north?: number;
}

type BuildingWithAvailability = Building & { available: number };

export function Masterplan({
  buildings,
  apartments,
  image,
  hotspots,
  basePath,
  variant = "full",
  className,
  north,
}: MasterplanProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedRect, setSelectedRect] = useState<Rect | null>(null);

  const buildingStats: BuildingWithAvailability[] = buildings.map((building) => ({
    ...building,
    available: apartments.filter((a) => a.buildingId === building.id && a.status === "available").length,
  }));

  const active = buildingStats.find((b) => b.id === selected) ?? null;
  const choose = (id: string, el: Element) => {
    setSelectedRect(rectOf(el));
    setSelected(id);
  };

  return (
    <div className="w-full">
      {/* items-start: the plan keeps its own 16:9 box whatever the panel beside it does (stretching it would crop the photo
            and slide the markers off their buildings). */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* Real aerial photo with selectable hotspots per building */}
        <div
          className={cn(
            "relative mx-auto aspect-[16/9] w-full overflow-hidden border border-line",
            className ?? "max-w-4xl"
          )}
        >
          <div className="absolute inset-0">
            <Media image={image} className="h-full w-full" sizes="(max-width: 1280px) 100vw, 1024px" />
          </div>

          {north !== undefined && <Compass north={north} />}

          {buildingStats.map((building) => {
            const spot = hotspots[building.id];
            if (!spot) return null;

            const isHovered = hovered === building.id;
            const isSelected = selected === building.id;
            const isUnavailable = building.available === 0;
            const isDimmed = Boolean(selected) && !isSelected && !isHovered;

            return (
              <button
                type="button"
                key={building.id}
                onMouseEnter={() => setHovered(building.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(building.id)}
                onBlur={() => setHovered(null)}
                onClick={(e) => {
                  setSelectedRect(rectOf(e.currentTarget));
                  setSelected((current) => (current === building.id ? null : building.id));
                }}
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
                      : isUnavailable
                        ? "border-on-chrome/20 bg-ink/20 text-on-chrome/62"
                        : isHovered
                          ? "border-accent bg-accent/25 text-chrome"
                          : "border-on-chrome/50 bg-chrome/85 text-on-chrome"
                  )}
                >
                  {building.shortLabel}
                </motion.div>

                {/* Quick hover preview — independent of the persistent selected panel */}
                <motion.div
                  initial={false}
                  animate={{ opacity: isHovered && !isSelected ? 1 : 0, y: isHovered && !isSelected ? 0 : 6 }}
                  className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 w-44 -translate-x-1/2 border border-on-chrome/10 bg-chrome p-3.5 text-left text-on-chrome"
                >
                  <div className="text-base font-medium">{building.name}</div>
                  <div className="mt-2 space-y-1 text-label text-on-chrome/70">
                    <div>
                      {floorsText(building.floors.length)} · {unitsText(building.totalApartments)}
                    </div>
                    <div>
                      {building.available} {availableWord(building.available)} сега
                    </div>
                    <div>{STATUS_LABEL[building.status]}</div>
                  </div>
                </motion.div>
              </button>
            );
          })}
        </div>

        {/* Desktop — persistent, refined info panel beside the plan */}
        <div className="hidden lg:block">
          <PanelStack
            buildings={buildingStats}
            active={active}
            basePath={basePath}
            originRect={selectedRect}
            onChoose={choose}
            idle={
              <div className="flex h-full flex-col justify-center border border-dashed border-line p-6 text-center">
                <p className="text-sm leading-relaxed text-muted">
                  Изберете зграда од планот за катови, достапност и фаза на изградба.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {buildingStats.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      aria-pressed={selected === b.id}
                      aria-label={`Зграда ${b.shortLabel}`}
                      onClick={(e) => {
                        setSelectedRect(rectOf(e.currentTarget));
                        setSelected(b.id);
                      }}
                      onMouseEnter={() => setHovered(b.id)}
                      onMouseLeave={() => setHovered(null)}
                      className="focus-ring flex h-11 w-11 items-center justify-center border border-line text-base font-medium text-muted transition-colors hover:border-accent hover:text-gold-deep"
                    >
                      {b.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* Mobile — a dedicated selector strip instead of a shrunken hover UI */}
      <div className="mt-6 lg:hidden">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {buildingStats.map((building) => {
            const isSelected = selected === building.id;
            return (
              <button
                key={building.id}
                type="button"
                onClick={(e) => {
                  setSelectedRect(rectOf(e.currentTarget));
                  setSelected((current) => (current === building.id ? null : building.id));
                }}
                className={cn(
                  "focus-ring flex min-h-12 shrink-0 items-center gap-2.5 border px-4 py-2.5 text-base transition-colors active:scale-[0.97]",
                  isSelected ? "border-accent bg-accent/10 text-charcoal" : "border-line text-muted"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border text-label font-semibold",
                    isSelected ? "border-accent bg-accent text-chrome" : "border-line text-muted"
                  )}
                >
                  {building.shortLabel}
                </span>
                Зграда {building.shortLabel}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <PanelStack
            buildings={buildingStats}
            active={active}
            basePath={basePath}
            originRect={selectedRect}
            onChoose={choose}
            idle={
              <div className="flex h-full flex-col justify-center border border-dashed border-line p-6 text-center">
                <p className="text-sm leading-relaxed text-muted">
                  Допрете на зграда погоре за катови, достапност и фаза на изградба.
                </p>
              </div>
            }
          />
        </div>
      </div>

      {variant === "full" && (
        <p
          aria-hidden={active ? true : undefined}
          className={cn("mx-auto mt-6 hidden max-w-md text-center text-sm text-muted lg:block", active && "invisible")}
        >
          Сите згради се достапни за истражување — изберете од планот или од листата.
        </p>
      )}
    </div>
  );
}

/**
 * The idle note and the six building panels share one grid cell, and only one of them is shown: the cell is as tall as
 * the tallest, so choosing (or changing) a building never moves what is below. The others are invisible stand-ins
 * without the photo, so they cost nothing to load and cannot be reached.
 */
function PanelStack({
  buildings,
  active,
  basePath,
  originRect,
  onChoose,
  idle,
}: {
  buildings: BuildingWithAvailability[];
  active: BuildingWithAvailability | null;
  basePath: string;
  originRect: Rect | null;
  onChoose: (id: string, el: Element) => void;
  idle: ReactNode;
}) {
  return (
    <div className="grid">
      {active ? (
        <div aria-hidden inert className="invisible col-start-1 row-start-1">
          {idle}
        </div>
      ) : (
        <motion.div
          key="idle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION.base, ease: EASE }}
          className="col-start-1 row-start-1"
        >
          {idle}
        </motion.div>
      )}
      {buildings.map((b) =>
        b.id === active?.id ? (
          <motion.div
            key={`${b.id}-on`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: DURATION.base, ease: EASE }}
            className="col-start-1 row-start-1"
          >
            <BuildingPanel
              building={b}
              basePath={basePath}
              originRect={originRect}
              onChoose={onChoose}
              all={buildings}
            />
          </motion.div>
        ) : (
          <div key={b.id} aria-hidden inert className="invisible col-start-1 row-start-1">
            <BuildingPanel
              building={b}
              basePath={basePath}
              originRect={null}
              onChoose={onChoose}
              all={buildings}
              standIn
            />
          </div>
        )
      )}
    </div>
  );
}

function BuildingPanel({
  building,
  basePath,
  originRect,
  onChoose,
  all,
}: {
  building: BuildingWithAvailability;
  basePath: string;
  originRect: Rect | null;
  onChoose: (id: string, el: Element) => void;
  all: BuildingWithAvailability[];
  /** Only takes up the room: see PanelStack. */
  standIn?: boolean;
}) {
  return (
    <div className="flex h-full flex-col gap-5">
      <h3 className="m-0 font-display text-(length:--fs-h2) font-normal leading-[1.1]">{building.name}</h3>
      <div aria-hidden className="h-px w-full bg-line" />
      {building.description && <p className="m-0 text-base leading-[1.8] text-muted">{building.description}</p>}
      <p className="m-0 text-sm text-muted">
        {floorsText(building.floors.length)} · {unitsText(building.totalApartments)} · {building.available}{" "}
        {availableWord(building.available)}
      </p>
      <div className="flex items-center gap-3 text-label font-semibold uppercase tracking-label text-ink">
        <span aria-hidden className="block h-2 w-2 rounded-full bg-bronze" />
        {building.status === "completed" ? "Завршено" : "Во изградба"}
        {building.available > 0 && <> · Во продажба</>}
        <span className="sr-only"> · {STATUS_LABEL[building.status]}</span>
      </div>
      <ZoomNavLink
        href={`${basePath}/${building.id}`}
        label={building.name}
        originRect={originRect ? () => originRect : undefined}
        className="focus-ring flex w-full items-center justify-center gap-2 whitespace-nowrap border border-ink/30 px-6 py-3.5 text-label font-semibold uppercase tracking-label text-ink transition-colors hover:border-ink hover:bg-ink/5 active:scale-[0.97]"
      >
        Разгледајте ја зградата →
      </ZoomNavLink>
      <div className="mt-1 grid grid-cols-3 gap-2">
        {all.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-pressed={b.id === building.id}
            onClick={(e) => onChoose(b.id, e.currentTarget)}
            className={cn(
              "focus-ring min-h-12 border px-1 py-3 text-center font-display text-base transition-colors",
              b.id === building.id ? "border-onyx bg-onyx text-travertine" : "border-line text-ink hover:border-ink/40"
            )}
          >
            Зграда {Number(b.shortLabel)}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * A compass in the top-right corner of the photo: a thin ring, a slim diamond needle and the letter С (север) above it,
 * in the accent colour on a soft dark backing so it reads on the bright parts of the photo. The whole compass turns by
 * `north` degrees, so the needle points to north on the photo. It is decoration only and sits under the markers.
 */
function Compass({ north }: { north: number }) {
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
          fontSize="9"
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
