"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import type { FloorListItem } from "@/components/FloorList";
import { ZoomNavLink } from "@/components/ui/ZoomTransition";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * The building's floor picker, reimagined as a lobby directory board rather
 * than a plain settings-style list. The building's own exterior render is
 * an angled 3D render, not a clean elevation — overlaying literal per-floor
 * hotspots on it would misalign against real windows and look fabricated,
 * so this interaction is a distinct, honest UI object instead of pretending
 * the photo has floor markers it doesn't (the photo already leads the page,
 * above this section). Each row "steps forward" on hover/focus rather than
 * just changing color, so choosing a floor reads as moving toward it.
 */
export function BuildingDirectory({
  buildingName,
  floors,
  basePath,
  activeFloor,
}: {
  buildingName: string;
  floors: FloorListItem[];
  basePath: string;
  activeFloor?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const floorsTopDown = [...floors].sort((a, b) => b.number - a.number);

  return (
    <div className="mx-auto max-w-xl overflow-hidden border border-line bg-warm-white">
      <div className="flex items-center gap-2.5 border-b border-line bg-cream px-5 py-3 text-muted">
        <Building2 className="h-4 w-4" strokeWidth={1.5} />
        <span className="eyebrow">{buildingName} · Директориум на катови</span>
      </div>
      <div className="flex flex-col">
        {floorsTopDown.map((floor) => {
          const isActive = activeFloor === floor.number;
          const isHovered = hovered === floor.number;
          return (
            <ZoomNavLink
              key={floor.number}
              href={`${basePath}/${floor.number}`}
              label={floor.label}
              onMouseEnter={() => setHovered(floor.number)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(floor.number)}
              onBlur={() => setHovered(null)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "focus-ring group relative flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-b-0",
                isActive && "bg-accent-soft/25"
              )}
            >
              <motion.span
                animate={{ x: isHovered || isActive ? 6 : 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="flex flex-1 items-center gap-4"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    isActive || isHovered ? "border-accent bg-accent text-chrome" : "border-line text-muted"
                  )}
                >
                  {floor.number}
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span
                    className={cn(
                      "text-base transition-colors",
                      isActive || isHovered ? "font-semibold text-charcoal" : "text-ink/75"
                    )}
                  >
                    {floor.label}
                  </span>
                  <span className="text-xs text-muted">{floor.meta}</span>
                </span>
              </motion.span>
              <motion.span
                initial={false}
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -8 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="hidden shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-gold-deep sm:flex"
              >
                Влези <ArrowRight className="h-3.5 w-3.5" />
              </motion.span>
            </ZoomNavLink>
          );
        })}
      </div>
    </div>
  );
}
