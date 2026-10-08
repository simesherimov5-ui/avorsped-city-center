import { Suspense } from "react";
import { projects } from "@/data";
import { heroSlides } from "@/lib/project-explorer";
import { ProjectsHero } from "@/components/projects/ProjectsHero";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
import { SoonBand } from "@/components/projects/SoonBand";

/** The projects page (design board 03b): the hero slideshow, the filter bar with the grid and the map, the «Наскоро» band. */
export default function ProjectsPage() {
  return (
    <>
      <ProjectsHero slides={heroSlides(projects)} />
      <Suspense fallback={null}>
        <ProjectsExplorer projects={projects} />
      </Suspense>
      <SoonBand />
    </>
  );
}
