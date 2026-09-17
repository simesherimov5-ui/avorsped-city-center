"use client";

import { useState } from "react";
import type { ConstructionStage } from "@/types";
import { Placeholder } from "@/components/ui/Placeholder";
import { cn } from "@/lib/cn";

export function ConstructionTimeline({ stages }: { stages: ConstructionStage[] }) {
  const [activeKey, setActiveKey] = useState(stages[0].key);
  const active = stages.find((s) => s.key === activeKey) ?? stages[0];

  return (
    <div>
      <div className="relative flex justify-between overflow-x-auto pb-2">
        <div className="absolute left-0 right-0 top-3 h-px bg-line" aria-hidden />
        {stages.map((stage) => {
          const isActive = stage.key === activeKey;
          return (
            <button
              key={stage.key}
              onClick={() => setActiveKey(stage.key)}
              className="focus-ring relative z-10 flex min-w-[92px] flex-col items-center gap-2 px-1"
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[10px]",
                  stage.percentComplete === 100
                    ? "border-accent bg-accent text-charcoal"
                    : isActive
                      ? "border-accent text-accent bg-warm-white"
                      : "border-concrete bg-warm-white text-ink/40"
                )}
              >
                {stage.percentComplete}%
              </span>
              <span
                className={cn(
                  "text-center text-[11px] leading-tight",
                  isActive ? "text-charcoal font-medium" : "text-ink/50"
                )}
              >
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Placeholder label={`${active.label} — фотографија од напредокот`} className="aspect-[4/3]" />
        <div>
          <div className="text-xs uppercase tracking-widest text-accent">{active.date}</div>
          <h3 className="mt-1 font-display text-2xl">{active.label}</h3>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">{active.description}</p>
          <div className="mt-4 h-1.5 w-full bg-line">
            <div className="h-full bg-accent" style={{ width: `${active.percentComplete}%` }} />
          </div>
          <div className="mt-1.5 text-xs text-ink/50">{active.percentComplete}% завршено</div>
        </div>
      </div>
    </div>
  );
}
