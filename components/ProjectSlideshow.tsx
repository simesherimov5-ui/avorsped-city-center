"use client";

import { useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { projectStatusLabel } from "@/lib/format";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { Project } from "@/types";

const AUTOPLAY_MS = 4000;
const FADE_S = 1.2;
const SWIPE_PX = 50;

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

/**
 * Full-width projects slider. Each slide lasts 4s and its gold dash fills in step; the dash's own
 * animation ends the slide, so pausing (hover, keyboard focus, hidden tab) freezes both and any
 * arrow, dash, swipe or key restarts the timer. Slides crossfade over 1.2s while the new photo
 * settles from 1.08 to 1, then drifts to 1.05 for the rest of its time. Reduced motion: no
 * autoplay, no zoom, no text animation.
 */
export function ProjectSlideshow({ projects }: { projects: Project[] }) {
  // Not Framer's useReducedMotion: it reports the real value during hydration, which differs from the
  // server's HTML and triggers a hydration mismatch. This hook starts false and then follows the setting.
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const tabHidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false
  );
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + projects.length) % projects.length);
  const paused = hovered || focused || tabHidden;
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const statusText = project.statusLabelOverride ?? projectStatusLabel(project.status);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
  };
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") swipeStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(e.clientY - start.y)) go(dx < 0 ? 1 : -1);
  };

  // Text comes in after the photo: label, name, address, button, 0.1s apart.
  const textIn = (step: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.55 + step * 0.1, ease: "easeOut" as const },
        };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Проекти"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipeStart.current = null)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
      onBlur={() => setFocused(false)}
      className="focus-ring relative h-[clamp(400px,60dvh,520px)] w-full touch-pan-y overflow-hidden bg-ink md:h-[clamp(380px,28vw,560px)]"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={project.id}
          aria-roledescription="slide"
          aria-label={`${index + 1} / ${projects.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // The outgoing slide stays fully visible underneath until the new one has faded in over it.
          exit={{ opacity: 1, transition: { duration: reduceMotion ? 0 : FADE_S } }}
          transition={{ duration: reduceMotion ? 0 : FADE_S, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* A portrait photo shown in full (imageFit "contain") would leave flat bars at the sides, and
              cropping it would cut the building — so the bars get a soft, dark blur of the same photo. */}
          {project.imageFit === "contain" && (
            <div aria-hidden className="absolute inset-0 scale-125 opacity-45 blur-2xl">
              <Media image={project.heroImage} tone="dark" fit="cover" className="h-full w-full" sizes="50vw" />
            </div>
          )}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: reduceMotion ? 1 : 1.08 }}
            animate={{ scale: reduceMotion ? 1 : [1.08, 1, 1.05] }}
            transition={{
              duration: FADE_S + AUTOPLAY_MS / 1000,
              times: [0, FADE_S / (FADE_S + AUTOPLAY_MS / 1000), 1],
              ease: ["easeOut", "linear"],
            }}
          >
            <Media
              image={project.heroImage}
              tone="dark"
              fit={project.imageFit ?? "cover"}
              focus={project.imageFocus}
              className="h-full w-full !bg-transparent"
              sizes="100vw"
              priority={index === 0}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-chrome/90 via-chrome/25 to-chrome/10" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-7xl px-5 pb-14 text-on-chrome sm:px-8 sm:pb-16 lg:px-10">
              <motion.span {...textIn(0)} className="eyebrow inline-block bg-accent px-2.5 py-1 text-chrome">
                {statusText}
              </motion.span>
              <motion.h2 {...textIn(1)} className="mt-3 font-display text-[clamp(1.75rem,6vw,2.75rem)] leading-tight">
                {project.name}
              </motion.h2>
              <motion.div {...textIn(2)} className="mt-1 text-base text-on-chrome/75 sm:text-sm">
                {project.location}
              </motion.div>
              <motion.div {...textIn(3)} className="mt-4 sm:mt-5">
                <Button
                  href={project.href ?? `/projects/${project.slug}`}
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  Погледни го проектот
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Preloads the next photo so the crossfade never waits on the network. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-0">
        <Media
          image={next.heroImage}
          fit={next.imageFit ?? "cover"}
          focus={next.imageFocus}
          className="h-full w-full"
          sizes="100vw"
          priority
        />
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Претходен проект"
        className="focus-ring absolute bottom-0 left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-chrome/55 text-on-chrome transition-colors hover:bg-chrome sm:bottom-auto sm:left-4 sm:top-1/2 sm:-translate-y-1/2"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Следен проект"
        className="focus-ring absolute bottom-0 right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-chrome/55 text-on-chrome transition-colors hover:bg-chrome sm:bottom-auto sm:right-4 sm:top-1/2 sm:-translate-y-1/2"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center">
        {projects.map((p, i) => {
          const active = i === index;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={p.name}
              aria-current={active}
              className="focus-ring group flex h-11 w-12 items-center justify-center"
            >
              <span className="relative block h-[3px] w-9 overflow-hidden bg-on-chrome/30">
                {active &&
                  (reduceMotion ? (
                    <span className="absolute inset-0 bg-gold" />
                  ) : (
                    <span
                      key={index}
                      className="slide-progress absolute inset-0 bg-gold"
                      style={{
                        animationDuration: `${AUTOPLAY_MS}ms`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                      onAnimationEnd={() => go(1)}
                    />
                  ))}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
