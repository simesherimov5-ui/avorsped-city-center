import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { projectStatusLabel } from "@/lib/format";
import type { Project } from "@/types";

export function ProjectShowcase({ projects }: { projects: Project[] }) {
  return (
    <div className="flex flex-col">
      {projects.map((project) => {
        const statusText = project.statusLabelOverride ?? projectStatusLabel(project.status);

        return (
          <Link
            key={project.id}
            href={project.href ?? `/projects/${project.slug}`}
            className="focus-ring group relative block aspect-[4/3] overflow-hidden border-t border-line first:border-t-0 sm:aspect-[21/9]"
          >
            <ParallaxImage>
              <Media
                image={project.heroImage}
                label={`${project.name} — визуелизација`}
                tone="dark"
                fit={project.imageFit ?? "cover"}
                className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="100vw"
              />
            </ParallaxImage>
            <div className="absolute inset-0 bg-gradient-to-t from-chrome/85 via-chrome/15 to-transparent transition-colors duration-500 group-hover:from-chrome/95" />

            <div className="absolute inset-0 flex items-end justify-between gap-4 p-6 sm:p-12">
              <div className="text-on-chrome">
                <span className="eyebrow inline-block bg-accent px-2.5 py-1 text-chrome">{statusText}</span>
                <h3 className="mt-4 font-display text-2xl sm:text-4xl lg:text-5xl">{project.name}</h3>
                <div className="mt-2 text-sm tracking-wide text-on-chrome/70">{project.location}</div>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-on-chrome/70 text-on-chrome transition-colors duration-300 group-hover:border-on-chrome group-hover:bg-on-chrome group-hover:text-chrome sm:h-14 sm:w-14">
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
