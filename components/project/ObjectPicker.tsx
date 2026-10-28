"use client";

import { useState, type CSSProperties } from "react";
import { Compass } from "@/components/Masterplan";
import { projectStatusLabel } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ProjectObject, SitePlan } from "@/types";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The object picker of a project with a drawn site plan, working like City Center's masterplan: the plan on the left (its
 * own fixed proportions, so it never zooms, crops or moves), the chosen object's panel on the right (under the plan on a
 * phone) and the buttons 01–04 under the panel, always in step with the plan. The plan is drawn from the data (streets,
 * the plot, parking, lawns); each object on it is a real button (the number in Cormorant Garamond; chosen = filled Бронза with a
 * cream number; a mouse only tints it). Nothing is chosen at first. The panel keeps one height whatever it shows.
 */
export function ObjectPicker({
  projectName,
  objects,
  plan,
}: {
  projectName: string;
  objects: ProjectObject[];
  plan: SitePlan;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [vx, vy, vw, vh] = plan.viewBox.split(" ").map(Number);
  // a place on the plan as a share of its box, for the buttons and labels laid over the drawing
  const at = (x: number, y: number): CSSProperties => ({
    left: `${((x - vx) / vw) * 100}%`,
    top: `${((y - vy) / vh) * 100}%`,
  });
  const label = (o: ProjectObject) => `Објект ${o.number}, ${o.plot}`;
  const toggle = (id: string) => setSelected((s) => (s === id ? null : id));

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,640px)_320px] lg:justify-between">
      {/* the plan */}
      <div
        className="relative w-full overflow-hidden border border-line bg-sand"
        style={{ aspectRatio: `${vw} / ${vh}` }}
      >
        <svg viewBox={plan.viewBox} className="absolute inset-0 h-full w-full" aria-hidden>
          {plan.streets.map((s) => (
            <path key={s.d} d={s.d} fill="none" className="stroke-limestone" strokeWidth={s.width} />
          ))}
          <rect
            x={plan.site.x}
            y={plan.site.y}
            width={plan.site.width}
            height={plan.site.height}
            rx={plan.site.radius}
            className="fill-sand stroke-ink/30"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          {plan.innerStreets.map((r) => (
            <rect key={`i${r.x}-${r.y}`} {...r} className="fill-limestone" />
          ))}
          {plan.parking.map((r) => (
            <rect key={`p${r.x}-${r.y}`} {...r} className="fill-ink/[0.06]" />
          ))}
          {plan.lawns.map((r) => (
            <rect key={`l${r.x}-${r.y}`} {...r} className="fill-plan-green" />
          ))}
        </svg>

        {plan.streets
          .filter((s) => s.label && s.labelAt)
          .map((s) => (
            <span
              key={s.label}
              aria-hidden
              className="pointer-events-none absolute whitespace-nowrap text-label text-muted"
              style={{
                ...at(s.labelAt!.x, s.labelAt!.y),
                transform: `translate(-50%, -50%) rotate(${s.labelAngle ?? 0}deg)`,
              }}
            >
              {s.label}
            </span>
          ))}

        <Compass north={plan.north} />

        {objects.map((o) => {
          const f = plan.footprints[o.id];
          if (!f) return null;
          const isSelected = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={isSelected}
              aria-label={label(o)}
              onClick={() => toggle(o.id)}
              className={cn(
                "absolute flex items-center justify-center border-[1.2px] border-bronze font-display text-[clamp(22px,2.6vw,40px)] leading-none transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                isSelected ? "bg-bronze text-paper" : "bg-sand text-ink [@media(hover:hover)]:hover:bg-gold/20"
              )}
              style={{ ...at(f.x, f.y), width: `${(f.width / vw) * 100}%`, height: `${(f.height / vh) * 100}%` }}
            >
              {o.number}
            </button>
          );
        })}
      </div>

      {/* the panel and the buttons under it */}
      <div>
        <div className="grid">
          {/* every state takes the same cell, so the panel is as tall as the tallest and nothing below it moves */}
          <div
            aria-hidden={selected !== null}
            className={cn(
              "col-start-1 row-start-1 flex flex-col justify-center border border-dashed border-line p-6 text-center",
              selected !== null && "invisible"
            )}
          >
            <p className="m-0 text-sm leading-relaxed text-muted">Изберете објект од планот.</p>
          </div>
          {objects.map((o) => (
            <div
              key={o.id}
              aria-hidden={selected !== o.id}
              aria-live={selected === o.id ? "polite" : undefined}
              className={cn("col-start-1 row-start-1 flex flex-col gap-4", selected !== o.id && "invisible")}
            >
              <div className="eyebrow tracking-[0.32em] text-gold-deep">
                {projectName} · Објект {o.number}
              </div>
              <h3 className="m-0 font-display text-[clamp(36px,3vw,48px)] font-normal leading-[1.05] text-ink">
                Објект {o.number}
              </h3>
              <div aria-hidden className="h-px w-full bg-line" />
              <p className="m-0 text-base text-ink">{o.plot}</p>
              <div className="flex items-center gap-3 text-label font-semibold uppercase tracking-label text-ink">
                <span aria-hidden className="block h-2 w-2 rounded-full bg-bronze" />
                {projectStatusLabel(o.status)}
              </div>
              <p className="m-0 text-sm leading-relaxed text-muted">Деталите за објектот следуваат наскоро.</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-4 gap-2">
          {objects.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={selected === o.id}
              aria-label={label(o)}
              onClick={() => setSelected(o.id)}
              className={cn(
                "focus-ring min-h-12 border px-1 py-3 text-center font-display text-base transition-colors",
                selected === o.id ? "border-onyx bg-onyx text-travertine" : "border-line text-ink hover:border-ink/40"
              )}
            >
              {pad(o.number)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
