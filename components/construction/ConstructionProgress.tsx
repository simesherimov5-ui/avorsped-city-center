"use client";

import { useRef, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { RevealHeading } from "@/components/motion/RevealHeading";
import { cn } from "@/lib/cn";
import type { ConstructionProgressData, Project } from "@/types";
import { CONSTRUCTION_PHASES, showsConstructionProgress } from "./phases";

const phaseIndex = (data: ConstructionProgressData) =>
  Math.max(
    0,
    CONSTRUCTION_PHASES.findIndex((p) => p.key === data.currentPhase)
  );
const clampPercent = (n: number) => Math.min(100, Math.max(0, n));

/** Whole-project progress as 0..1: finished phases plus the current one's share, out of five. */
const overall = (data: ConstructionProgressData) =>
  (phaseIndex(data) + clampPercent(data.percent) / 100) / CONSTRUCTION_PHASES.length;

function formatUpdated(iso: string) {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}.${m}.${y}` : iso;
}

type Props = {
  project: Pick<Project, "status" | "construction">;
  /** "full" is the section on a project's page; "compact" is the single thin bar on its card. */
  variant?: "full" | "compact";
  className?: string;
};

/**
 * Construction progress for a project. It shows only for projects whose status is "under-construction"
 * (and that have progress data), so a finished or upcoming project never gets one, and any future project
 * with that status gets it automatically.
 */
export function ConstructionProgress({ project, variant = "full", className }: Props) {
  const data = project.construction;
  if (!showsConstructionProgress(project) || !data) return null;
  return variant === "compact" ? (
    <Compact data={data} className={className} />
  ) : (
    <Full data={data} className={className} />
  );
}

function Compact({ data, className }: { data: ConstructionProgressData; className?: string }) {
  const phase = CONSTRUCTION_PHASES[phaseIndex(data)];
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3 text-xs text-ink/70">
        <span>{phase.label}</span>
        <span className="mono-stat text-gold-deep" style={{ letterSpacing: 0 }}>
          {clampPercent(data.percent)}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${phase.label}: ${clampPercent(data.percent)}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(overall(data) * 100)}
        className="mt-2 h-[3px] bg-ink/12"
      >
        <span className="block h-full bg-gold" style={{ width: `${overall(data) * 100}%` }} />
      </div>
    </div>
  );
}

function Full({ data, className }: { data: ConstructionProgressData; className?: string }) {
  const list = useRef<HTMLOListElement>(null);
  const current = phaseIndex(data);
  const percent = clampPercent(data.percent);

  // The gold line fills phase by phase, 1.6s in total, when the list scrolls into view.
  useGSAP(
    () => {
      const el = list.current;
      if (!el || prefersReducedMotion()) return;
      const fills = [...el.querySelectorAll<HTMLElement>("[data-frac]")];
      const total = fills.reduce((sum, f) => sum + Number(f.dataset.frac), 0);
      if (total === 0) return;
      gsap.set(fills, { "--p": 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      fills.forEach((f) => {
        const frac = Number(f.dataset.frac);
        if (frac > 0) tl.to(f, { "--p": frac, duration: (1.6 * frac) / total, ease: "none" });
      });
    },
    { scope: list }
  );

  return (
    <section className={className} aria-label="Тек на изградба">
      <div className="eyebrow eyebrow-ruled text-gold-deep">Тек на изградба</div>
      <RevealHeading as="h2" className="mt-4 font-display text-3xl sm:text-4xl">
        Градбата, фаза по фаза
      </RevealHeading>

      <ol ref={list} className="mt-10 md:grid md:grid-cols-5">
        {CONSTRUCTION_PHASES.map((phase, i) => {
          const state = i < current ? "done" : i === current ? "current" : "upcoming";
          const last = i === CONSTRUCTION_PHASES.length - 1;
          const frac = state === "done" ? 1 : state === "current" ? percent / 100 : 0;
          const sub =
            state === "done"
              ? "завршено"
              : state === "current"
                ? `во тек · ${percent}%`
                : last
                  ? data.handover
                  : "следно";
          return (
            <li
              key={phase.key}
              aria-current={state === "current" ? "step" : undefined}
              className="relative pb-7 pl-8 md:pb-0 md:pl-0 md:pt-9"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-[3px] h-[11px] w-[11px] rounded-full md:top-[4px]",
                  state === "done" && "border border-gold bg-gold",
                  state === "current" &&
                    "border-2 border-gold bg-paper shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-gold)_25%,transparent)]",
                  state === "upcoming" && "border border-ink/40 bg-paper"
                )}
              />
              {/* The line from this phase's dot to the next: vertical on phones, horizontal from md up. */}
              {!last && (
                <span
                  aria-hidden
                  className="absolute bottom-[-3px] left-[5px] top-[20px] w-px bg-ink/18 md:bottom-auto md:left-[11px] md:right-0 md:top-[9px] md:h-px md:w-auto"
                >
                  <span
                    data-frac={frac}
                    className="absolute inset-0 origin-top scale-y-[var(--p)] bg-gold md:origin-left md:scale-x-[var(--p)] md:scale-y-100"
                    style={{ "--p": frac } as CSSProperties}
                  />
                </span>
              )}
              <div className="text-[15px] text-ink">{phase.label}</div>
              <small className="mono-stat mt-1.5 block text-[12px] text-gold-deep" style={{ letterSpacing: 0 }}>
                {sub}
              </small>
            </li>
          );
        })}
      </ol>

      {data.updated && <p className="mt-8 text-sm text-ink/60">Ажурирано: {formatUpdated(data.updated)}</p>}
    </section>
  );
}
