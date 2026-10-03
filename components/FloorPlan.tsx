"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Apartment } from "@/types";
import { formatArea, statusLabel, typeLabel } from "@/lib/format";
import { StatusLegend } from "@/components/ui/StatusBadge";

export function FloorPlan({ apartments }: { apartments: Apartment[] }) {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const activeApt = apartments.find((a) => a.id === active);

  return (
    <div>
      {/* On a phone the plan keeps a readable size and scrolls sideways inside this box. */}
      <div className="overflow-x-auto border border-line bg-warm-white p-3 sm:p-6">
        <svg
          viewBox="0 0 100 100"
          className="w-full min-w-[480px] sm:min-w-0"
          // a group, not an image: role="img" would hide the apartments inside it from assistive technology
          role="group"
          aria-label="Основа на кат со кликабилни станови"
        >
          <defs>
            {/* Reserved units are hatched: diagonal ink lines, so the status never depends on colour alone. */}
            <pattern id="fp-hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="3" className="stroke-ink" strokeOpacity="0.45" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="none" className="stroke-line" strokeWidth="0.5" />
          {apartments.map((apt) => {
            const [p0, p1, p2, p3] = apt.shape.points;
            const points = [p0, p1, p2, p3].map((p) => p.join(",")).join(" ");
            const isActive = active === apt.id;
            return (
              <g key={apt.id}>
                <polygon
                  points={points}
                  data-status={apt.status}
                  data-active={isActive || undefined}
                  className="fp-poly cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label={`Стан ${apt.number}, ${statusLabel(apt.status)}, ${formatArea(apt.area)}`}
                  onMouseEnter={() => setActive(apt.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(apt.id)}
                  onBlur={() => setActive(null)}
                  onClick={() => router.push(`/apartments/${apt.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") router.push(`/apartments/${apt.id}`);
                  }}
                />
                <text
                  x={apt.shape.labelPosition[0]}
                  y={apt.shape.labelPosition[1]}
                  textAnchor="middle"
                  fontSize="3.2"
                  className="pointer-events-none select-none fill-ink"
                >
                  {apt.number}
                </text>
                <text
                  x={apt.shape.labelPosition[0]}
                  y={apt.shape.labelPosition[1] + 5}
                  textAnchor="middle"
                  fontSize="2.4"
                  className="pointer-events-none select-none fill-muted"
                >
                  {formatArea(apt.area)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <StatusLegend />
        <div className="min-h-[1.25rem] text-base text-muted sm:text-sm">
          {activeApt ? (
            `Стан ${activeApt.number} — ${typeLabel(activeApt.type)}, ${formatArea(activeApt.area)}, ${statusLabel(activeApt.status)}`
          ) : (
            <>
              <span className="[@media(hover:none)]:hidden">
                Задржете го покажувачот или кликнете на стан за детали
              </span>
              <span className="hidden [@media(hover:none)]:inline">
                Допрете стан за детали (основата се движи настрана)
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
