"use client";

import { useState } from "react";
import { projects } from "@/data";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectSlideshow } from "@/components/ProjectSlideshow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { PullQuote } from "@/components/ui/PullQuote";
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
    <div className="pt-[61px] sm:pt-[69px] lg:pt-[85px]">
      <ProjectSlideshow projects={projects} />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-14 lg:px-10">
        <SectionHeading
          as="h1"
          eyebrow="Портфолио"
          title="Нашите проекти"
          size="compact"
          description="Од нашата прва станбена зграда до City Center."
        />

        <div className="mt-10 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "focus-ring min-h-11 border px-4 py-2 text-base transition-colors duration-300 sm:text-sm",
                tab === t.value
                  ? "border-charcoal bg-charcoal text-paper"
                  : "border-line text-muted hover:border-gold-deep hover:text-charcoal"
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

      {/* Where the projects end: what we think of each one */}
      <section className="bg-warm-white py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
          <PullQuote tone="light">„Секој проект започнува со прашањето: како ќе се живее тука?“</PullQuote>
          <p className="mt-8 max-w-[56ch] text-base leading-[1.75] text-ink/80">
            Секој проект го гледаме како можност да оставиме траен печат и да придонесеме за подобра заедница. Вашето
            задоволство е наш приоритет!
          </p>
        </div>
      </section>
    </div>
  );
}
