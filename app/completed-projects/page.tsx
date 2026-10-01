import type { Metadata } from "next";
import { projects } from "@/data";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Завршени проекти",
  description: "Завршените станбени проекти на Јавор Шпед.",
};

export default function CompletedProjectsPage() {
  const completed = projects.filter((p) => p.status === "completed");

  return (
    <div className="pt-28">
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <SectionHeading
          eyebrow="Портфолио"
          title="Завршени проекти"
          description="Проекти на Јавор Шпед со завршена изградба, целосно предадени на сопствениците."
        />

        <div className="mt-10">
          {completed.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Сè уште немаме завршен проект"
              description="Сите наши проекти во моментов се во изградба или во планирање. Штом еден проект биде целосно завршен и предаден, ќе се појави овде."
              action={<Button href="/projects">Погледни ги сите проекти</Button>}
            />
          )}
        </div>
      </section>
    </div>
  );
}
