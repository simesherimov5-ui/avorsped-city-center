import { Suspense } from "react";
import { projects } from "@/data";
import { heroSlides } from "@/lib/project-explorer";
import { ProjectsHero } from "@/components/projects/ProjectsHero";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
import { SoonBand } from "@/components/projects/SoonBand";

/**
 * The page's heading when no project has a photo for the hero (the slideshow only shows projects with a photo): the same
 * h1 on Оникс under the bar, so the page never loses its heading.
 */
function ProjectsHeading() {
  return (
    <section className="grain grain--dark bg-chrome text-on-chrome">
      <div className="mx-auto max-w-7xl px-5 pb-14 pt-[calc(var(--nav-h)+48px)] sm:px-8 lg:px-10">
        <h1 className="pj-h1">Разгледајте ги нашите проекти.</h1>
        <p className="pj-under photo-hero__eyebrow mt-4">Можеби вашиот дом веќе ве чека.</p>
      </div>
    </section>
  );
}

/** The projects page (design board 03b): the hero slideshow, the filter bar with the grid and the map, the «Наскоро» band. */
export default function ProjectsPage() {
  const slides = heroSlides(projects);
  return (
    <>
      {slides.length > 0 ? <ProjectsHero slides={slides} /> : <ProjectsHeading />}
      <Suspense fallback={<div aria-hidden className="grain min-h-[640px] bg-sand" />}>
        <ProjectsExplorer projects={projects} />
      </Suspense>
      <SoonBand />
    </>
  );
}
