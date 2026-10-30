"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
  type KeyboardEvent,
  type FocusEvent,
} from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";

const SWIPE_PX = 50;

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

/**
 * The state of a photo slideshow shared by the Радовиш Twins opening and «Другите наши проекти»: the slide on screen, the
 * one being faded over, the restart counter of the dash's timer, and the pause rules (the mouse over it, keyboard
 * focus, a hidden tab, the pause button, and with `pauseOffscreen` also the section being out of view). A dash, a swipe
 * (horizontal only, touch and pen) or an arrow key moves the slide and restarts the timer. Reduced motion: no fade.
 * The page spreads `sectionProps` on its section (and `ref` too with `pauseOffscreen`), and ends a slide with `onSlideEnd`.
 */
export function useSlideshow({ count, pauseOffscreen = false }: { count: number; pauseOffscreen?: boolean }) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [index, setIndex] = useState(0);
  // the photo being faded over: it stays fully shown underneath until the new one has come in
  const [previous, setPrevious] = useState<number | null>(null);
  // each move of the visitor restarts the timer of the photo they chose
  const [restart, setRestart] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const tabHidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false
  );
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!pauseOffscreen || !el) return;
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [pauseOffscreen]);

  const show = (i: number) => {
    const next = (i + count) % count;
    if (next === index) return;
    setPrevious(reduce ? null : index);
    setIndex(next);
  };
  const goTo = (i: number) => {
    show(i);
    setRestart((n) => n + 1);
  };

  const sectionProps = {
    onPointerDown: (e: PointerEvent) => {
      if (e.pointerType !== "mouse") swipeStart.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: PointerEvent) => {
      const start = swipeStart.current;
      swipeStart.current = null;
      if (!start || count < 2) return;
      const dx = e.clientX - start.x;
      if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(e.clientY - start.y)) goTo(index + (dx < 0 ? 1 : -1));
    },
    onPointerCancel: () => (swipeStart.current = null),
    onPointerEnter: (e: PointerEvent) => e.pointerType === "mouse" && setHovered(true),
    onPointerLeave: () => setHovered(false),
    onFocus: (e: FocusEvent) => setFocused(e.target.matches(":focus-visible")),
    onBlur: (e: FocusEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
    },
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(index - 1);
      else if (e.key === "ArrowRight") goTo(index + 1);
    },
  };

  return {
    reduce,
    index,
    previous,
    clearPrevious: () => setPrevious(null),
    restart,
    stopped,
    toggleStop: () => !reduce && setStopped((s) => !s),
    paused: hovered || focused || tabHidden || stopped || offscreen,
    show,
    goTo,
    ref,
    sectionProps,
  };
}
