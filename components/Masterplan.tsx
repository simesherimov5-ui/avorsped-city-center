"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { buildings, apartments } from "@/data";
import { Media } from "@/components/ui/Media";

const STATUS_LABEL: Record<string, string> = {
  planning: "Планирање",
  foundation: "Темели",
  structure: "Конструкција",
  exterior: "Фасада",
  interior: "Внатрешно доуредување",
  completed: "Завршено",
};

interface MasterplanProps {
  variant?: "preview" | "full";
}

export function Masterplan({ variant = "full" }: MasterplanProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div
        className="mx-auto grid max-w-3xl gap-3 sm:gap-4"
        style={{ gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(4, auto)" }}
      >
        {buildings.map((building) => {
          const units = apartments.filter((a) => a.buildingId === building.id);
          const available = units.filter((a) => a.status === "available").length;
          const isHovered = hovered === building.id;

          return (
            <motion.div
              key={building.id}
              style={{
                gridColumn: building.position.col + 1,
                gridRow: building.position.row + 1,
              }}
              onHoverStart={() => setHovered(building.id)}
              onHoverEnd={() => setHovered(null)}
            >
              <Link
                href={`/development/${building.id}`}
                className="focus-ring group relative block aspect-[4/5] overflow-hidden border border-line bg-charcoal text-warm-white"
              >
                <div className="absolute inset-0">
                  <Media image={building.exteriorImage} tone="dark" className="h-full w-full" />
                </div>
                <motion.div
                  animate={{ opacity: isHovered ? 1 : 0.35 }}
                  className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent"
                />
                <div className="relative flex h-full flex-col justify-between p-3 sm:p-4">
                  <span className="font-display text-2xl sm:text-3xl">{building.shortLabel}</span>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-warm-white/70">
                      {building.name}
                    </div>
                    <motion.div
                      initial={false}
                      animate={{ height: isHovered ? "auto" : 0, opacity: isHovered ? 1 : 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-0.5 text-[11px] text-warm-white/70">
                        <div>{building.floors.length} ката · {building.totalApartments} станови</div>
                        <div>{available} достапни сега</div>
                        <div>{STATUS_LABEL[building.status]}</div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}

        <div
          style={{ gridColumn: 2, gridRow: 2 }}
          className="group relative flex items-end overflow-hidden border border-line"
        >
          <div className="absolute inset-0">
            <Media
              image={{ src: "/images/site/courtyard.jpg", alt: "Двор", isPlaceholder: false }}
              className="h-full w-full"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
          <span className="relative p-2 text-[11px] uppercase tracking-widest text-warm-white sm:p-3">
            Двор
          </span>
        </div>
        <div
          style={{ gridColumn: 2, gridRow: 3 }}
          className="group relative flex items-end overflow-hidden border border-line"
        >
          <div className="absolute inset-0">
            <Media
              image={{ src: "/images/site/central-area.jpg", alt: "Централна површина", isPlaceholder: false }}
              className="h-full w-full"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
          <span className="relative p-2 text-[11px] uppercase tracking-widest text-warm-white sm:p-3">
            Централна површина
          </span>
        </div>
      </div>

      {variant === "full" && (
        <p className="mx-auto mt-6 max-w-md text-center text-sm text-ink/50">
          Кликнете на било која зграда за да ги истражите нејзините катови, достапност и распоред на становите.
        </p>
      )}
    </div>
  );
}
