import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { ArrowRight } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { NoPhoto } from "@/components/ui/NoPhoto";
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
            className="focus-ring group relative block aspect-[4/3] overflow-hidden border-t border-line first:border-t-0 sm:aspect-[5/2]"
          >
            <ParallaxImage>
              {project.heroImage.isPlaceholder ? (
                <NoPhoto />
              ) : (
                <Media
                  image={project.heroImage}
                  label={`${project.name} — визуелизација`}
                  tone="dark"
                  fit={project.imageFit ?? "cover"}
                  focus={project.imageFocus}
                  className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes={
                    project.imageFit === "contain"
                      ? "(max-width: 639px) 100vw, 600px"
                      : "(max-width: 639px) 150vw, (max-width: 1280px) 100vw, 1200px"
                  }
                />
              )}
            </ParallaxImage>
            <div className="absolute inset-0 bg-gradient-to-t from-chrome/85 via-chrome/15 to-transparent transition-colors duration-500 group-hover:from-chrome/95" />

            <div className="absolute inset-0 flex items-end justify-between gap-4 p-6 sm:p-12">
              <div className="text-on-chrome">
                <span className="eyebrow inline-block bg-accent px-2.5 py-1 text-chrome">{statusText}</span>
                <h3 className="mt-3 font-display text-(length:--fs-h3) font-normal leading-[1.3]">{project.name}</h3>
                <div className="mt-2 text-sm tracking-wide text-gold">{project.location}</div>
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
