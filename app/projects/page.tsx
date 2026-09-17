"use client";

import { useState } from "react";
import { projects } from "@/data";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import type { ProjectStatus } from "@/types";

const TABS: { label: string; value: ProjectStatus | "all" }[] = [
  { label: "Сите", value: "all" },
  { label: "Завршено", value: "completed" },
  { label: "Во изградба", value: "under-construction" },
  { label: "Претстои", value: "upcoming" },
];

export default function ProjectsPage() {
  const [tab, setTab] = useState<ProjectStatus | "all">("all");
  const filtered = tab === "all" ? projects : projects.filter((p) => p.status === tab);

  return (
    <div className="pt-28">
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <SectionHeading eyebrow="Портфолио" title="Нашите проекти" description="Од нашата прва станбена зграда до City Center." />

        <div className="mt-10 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "focus-ring border px-4 py-2 text-sm",
                tab === t.value ? "border-accent bg-accent/10 text-charcoal" : "border-line text-ink/60 hover:border-accent/50"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
