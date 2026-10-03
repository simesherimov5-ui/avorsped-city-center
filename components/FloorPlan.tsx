"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Apartment, UnitStatus } from "@/types";
import { formatArea, statusLabel, typeLabel } from "@/lib/format";
import { StatusLegend } from "@/components/ui/StatusBadge";

const FILL: Record<UnitStatus, string> = {
  available: "rgba(5,150,105,0.16)",
  reserved: "rgba(245,158,11,0.18)",
  sold: "rgba(185,28,28,0.14)",
};
const STROKE: Record<UnitStatus, string> = {
  available: "#059669",
  reserved: "#d97706",
  sold: "#b91c1c",
};

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
          <rect x="0" y="0" width="100" height="100" fill="none" stroke="#dedad0" strokeWidth="0.5" />
          {apartments.map((apt) => {
            const [p0, p1, p2, p3] = apt.shape.points;
            const points = [p0, p1, p2, p3].map((p) => p.join(",")).join(" ");
            const isActive = active === apt.id;
            return (
              <g key={apt.id}>
                <polygon
                  points={points}
                  fill={isActive ? STROKE[apt.status] : FILL[apt.status]}
                  fillOpacity={isActive ? 0.3 : 1}
                  stroke={STROKE[apt.status]}
                  strokeWidth={isActive ? 0.8 : 0.4}
                  className="fp-poly cursor-pointer transition-all"
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
                  fill="#2b2a26"
                  className="pointer-events-none select-none"
                >
                  {apt.number}
                </text>
                <text
                  x={apt.shape.labelPosition[0]}
                  y={apt.shape.labelPosition[1] + 5}
                  textAnchor="middle"
                  fontSize="2.4"
                  fill="#6b6960"
                  className="pointer-events-none select-none"
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
        <div className="min-h-[1.25rem] text-base text-ink/60 sm:text-sm">
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
