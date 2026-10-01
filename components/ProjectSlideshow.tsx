"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { projectStatusLabel } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Project } from "@/types";

export function ProjectSlideshow({ projects }: { projects: Project[] }) {
  const [[index, direction], setIndex] = useState<[number, number]>([0, 0]);

  const go = (dir: 1 | -1) => setIndex(([i]) => [(i + dir + projects.length) % projects.length, dir]);
  const goTo = (i: number) => setIndex(([current]) => [i, i > current ? 1 : -1]);

  const project = projects[index];
  const statusText = project.statusLabelOverride ?? projectStatusLabel(project.status);

  return (
    <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[16/10]">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          initial={{ opacity: 0, x: direction >= 0 ? 60 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction >= 0 ? -60 : 60 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Media
            image={project.heroImage}
            tone="dark"
            fit={project.imageFit ?? "cover"}
            className="h-full w-full"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-chrome/85 via-chrome/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-on-chrome sm:p-10">
            <span className="eyebrow inline-block bg-accent px-2.5 py-1 text-chrome">
              {statusText}
            </span>
            <h2 className="mt-3 font-display text-2xl sm:text-4xl">{project.name}</h2>
            <div className="mt-1 text-sm text-on-chrome/70">{project.location}</div>
            <div className="mt-5">
              <Button href={project.href ?? `/projects/${project.slug}`} variant="primary">
                Погледни го проектот
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Претходен проект"
        className="focus-ring absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-chrome/60 text-on-chrome transition-colors hover:bg-chrome"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Следен проект"
        className="focus-ring absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-chrome/60 text-on-chrome transition-colors hover:bg-chrome"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {projects.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={p.name}
            className={cn("h-1.5 w-6 rounded-full transition-colors", i === index ? "bg-accent" : "bg-on-chrome/40")}
          />
        ))}
      </div>
    </div>
  );
}
