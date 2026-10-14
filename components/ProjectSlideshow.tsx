"use client";

import { useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { projectStatusLabel } from "@/lib/format";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { Project } from "@/types";

const DEFAULT_AUTOPLAY_MS = 4000;
const FADE_S = 1.2;

const SWIPE_PX = 50;

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

/**
 * Full-width projects slider. Each slide lasts `autoplayMs` (4s unless the page says otherwise) and its gold dash fills in step; the dash's own
 * animation ends the slide, so pausing (the mouse over the slider, keyboard focus, a hidden tab) freezes both. Any
 * arrow, dash, swipe or key restarts the timer, so the slide the visitor chose gets a full interval before the show
 * moves on. Slides crossfade over 1.2s while the new photo
 * settles from 1.04 to 1. Reduced motion: no
 * autoplay, no zoom, no text animation.
 */
export function ProjectSlideshow({
  projects,
  headingAs = "h2",
  autoplayMs = DEFAULT_AUTOPLAY_MS,
}: {
  projects: Project[];
  /** How long each slide stays before the next one starts to fade in. */
  autoplayMs?: number;
  /** The slide's project name is a heading: "h3" where the page already has an h2 above the slider. */
  headingAs?: "h2" | "h3";
}) {
  const Heading = headingAs === "h3" ? motion.h3 : motion.h2;
  // Not Framer's useReducedMotion: it reports the real value during hydration, which differs from the
  // server's HTML and triggers a hydration mismatch. This hook starts false and then follows the setting.
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [index, setIndex] = useState(0);
  // Counts the visitor's own moves (arrows, keys, swipe, dots): each one restarts the timer, so the chosen slide stays a full interval.
  const [restart, setRestart] = useState(0);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const tabHidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false
  );
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const go = (dir: 1 | -1, byVisitor = true) => {
    if (byVisitor) setRestart((n) => n + 1);
    setIndex((i) => (i + dir + projects.length) % projects.length);
  };
  const paused = focused || hovered || tabHidden;
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
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
      onBlur={() => setFocused(false)}
      className="container-x focus-ring touch-pan-y"
    >
      {/* One clean 16:9 photo; the status, name, place and button sit bottom-left on a scrim that only covers the lower part. */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-espresso sm:aspect-[16/9]">
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
            <motion.div
              className="absolute inset-0"
              initial={{ scale: reduceMotion ? 1 : 1.04 }}
              animate={{ scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : FADE_S, ease: [0.22, 1, 0.36, 1] }}
            >
              <Media
                image={project.heroImage}
                tone="dark"
                fit="cover"
                focus={project.imageFocus}
                className="h-full w-full !bg-transparent"
                sizes="(max-width: 1200px) 100vw, 1152px"
                priority={index === 0}
              />
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-chrome/85 via-chrome/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-on-chrome sm:p-10">
              <motion.span {...textIn(0)} className="eyebrow inline-block bg-accent px-2.5 py-1 text-chrome">
                {statusText}
              </motion.span>
              <Heading {...textIn(1)} className="mt-3 font-display text-(length:--fs-h3) font-normal leading-[1.3]">
                {project.name}
              </Heading>
              <motion.div {...textIn(2)} className="mt-1 text-sm text-on-chrome/90">
                {project.location}
              </motion.div>
              <motion.div {...textIn(3)} className="mt-5">
                <Button
                  href={project.href ?? `/projects/${project.slug}`}
                  variant="primary"
                  tone="dark"
                  className="w-full sm:w-auto"
                >
                  Погледни го проектот
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Preloads the next photo so the crossfade never waits on the network. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-0">
          <Media
            image={next.heroImage}
            fit="cover"
            focus={next.imageFocus}
            className="h-full w-full"
            sizes="(max-width: 1200px) 100vw, 1152px"
            priority
          />
        </div>
      </div>

      {/* The controls sit under the photo: the arrows on the container's two edges, the dashes between them. */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Претходен проект"
          className="focus-ring flex h-11 w-11 items-center justify-center border border-on-chrome/30 text-on-chrome transition-colors hover:border-accent hover:text-accent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex justify-center">
          {projects.map((p, i) => {
            const active = i === index;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setRestart((n) => n + 1);
                  setIndex(i);
                }}
                aria-label={p.name}
                aria-current={active}
                className="focus-ring group flex h-11 w-12 items-center justify-center"
              >
                <span className="relative block h-[3px] w-9 overflow-hidden bg-on-chrome/30">
                  {active &&
                    (reduceMotion ? (
                      <span className="absolute inset-0 bg-accent" />
                    ) : (
                      <span
                        key={`${index}-${restart}`}
                        className="slide-progress absolute inset-0 bg-accent"
                        style={{
                          animationDuration: `${autoplayMs}ms`,
                          animationPlayState: paused ? "paused" : "running",
                        }}
                        onAnimationEnd={() => go(1, false)}
                      />
                    ))}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Следен проект"
          className="focus-ring flex h-11 w-11 items-center justify-center border border-on-chrome/30 text-on-chrome transition-colors hover:border-accent hover:text-accent"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
