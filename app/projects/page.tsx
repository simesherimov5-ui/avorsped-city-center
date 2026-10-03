"use client";

import { useState } from "react";
import { projects } from "@/data";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectSlideshow } from "@/components/ProjectSlideshow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import type { ProjectStatus } from "@/types";

const TABS: { label: string; value: ProjectStatus | "all" }[] = [
  { label: "Сите", value: "all" },
  { label: "Завршено", value: "completed" },
  { label: "Во изградба", value: "under-construction" },
  { label: "Наскоро", value: "upcoming" },
];

export default function ProjectsPage() {
  const [tab, setTab] = useState<ProjectStatus | "all">("all");
  const filtered = tab === "all" ? projects : projects.filter((p) => p.status === tab);

  return (
    <div className="pt-[93px] sm:pt-[117px] lg:pt-[157px]">
      <ProjectSlideshow projects={projects} />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-14 lg:px-10">
        <SectionHeading
          as="h1"
          eyebrow="Портфолио"
          title="Нашите проекти"
          description="Од нашата прва станбена зграда до City Center."
        />

        <div className="mt-10 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "focus-ring min-h-11 border px-4 py-2 text-base sm:text-sm",
                tab === t.value
                  ? "border-accent bg-accent/10 text-charcoal"
                  : "border-line text-muted hover:border-accent/50"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-10"
            title="Сè уште немаме завршен проект"
            description="Сите наши проекти во моментов се во изградба или во планирање."
          />
        )}
      </section>
    </div>
  );
}
