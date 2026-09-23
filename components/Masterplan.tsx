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

// Best-effort marker centers over each building's rooftop in the real aerial
// photo (percentages of the image, marker centered via translate). The photo
// has no printed labels, so this mapping is a visual estimate calibrated
// against the client's reference — adjust here if a number still looks off.
const AERIAL_HOTSPOTS: Record<string, { top: string; left: string }> = {
  b01: { top: "18%", left: "19%" },
  b02: { top: "46%", left: "21%" },
  b03: { top: "28%", left: "49%" },
  b04: { top: "54%", left: "68%" },
  b05: { top: "78%", left: "84%" },
  b06: { top: "78%", left: "49%" },
};

export function Masterplan({ variant = "full" }: MasterplanProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full">
      {/* Real aerial photo with clickable hotspots per building — same on every screen size */}
      <div className="relative mx-auto aspect-[16/9] w-full max-w-5xl overflow-hidden border border-line">
        <Media
          image={{
            src: "/images/site/masterplan-aerial.jpg",
            alt: "Ситуационен план — аерален поглед на комплексот",
            isPlaceholder: false,
          }}
          className="h-full w-full"
          sizes="(max-width: 1280px) 100vw, 1024px"
        />

        {buildings.map((building) => {
          const spot = AERIAL_HOTSPOTS[building.id];
          if (!spot) return null;

          const units = apartments.filter((a) => a.buildingId === building.id);
          const available = units.filter((a) => a.status === "available").length;
          const isHovered = hovered === building.id;

          return (
            <Link
              key={building.id}
              href={`/development/${building.id}`}
              onMouseEnter={() => setHovered(building.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(building.id)}
              onBlur={() => setHovered(null)}
              className="focus-ring group absolute -translate-x-1/2 -translate-y-1/2"
              style={spot}
            >
              <motion.div
                animate={{
                  scale: isHovered ? 1.15 : 1,
                  boxShadow: isHovered ? "0 0 0 8px rgba(184,150,46,0.3)" : "0 0 0 0px rgba(184,150,46,0)",
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-black text-xs font-bold text-white shadow-md sm:h-9 sm:w-9 sm:text-sm"
              >
                {building.shortLabel}
              </motion.div>

              <motion.div
                initial={false}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 6 }}
                className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-44 -translate-x-1/2 rounded-sm border border-line bg-charcoal p-3 text-left text-warm-white shadow-lg"
              >
                <div className="font-display text-base">{building.name}</div>
                <div className="mt-1.5 space-y-0.5 text-[11px] text-warm-white/70">
                  <div>{building.floors.length} ката · {building.totalApartments} станови</div>
                  <div>{available} достапни сега</div>
                  <div>{STATUS_LABEL[building.status]}</div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {variant === "full" && (
        <p className="mx-auto mt-6 max-w-md text-center text-sm text-ink/50">
          Кликнете на било која зграда за да ги истражите нејзините катови, достапност и распоред на становите.
        </p>
      )}
    </div>
  );
}
