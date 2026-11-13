"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { CALM_EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import {
  CLICK_ZOOM,
  IDENTITY,
  TAP_SLOP,
  atMaxZoom,
  clampView,
  isDoubleTap,
  isZoomed,
  panBy,
  stepScale,
  wheelScale,
  zoomAt,
  type View,
} from "@/lib/zoom";

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-copper)]";
// 44px round buttons on a soft dark circle (like the lightbox's arrows on a phone), so they read on a plan's light frame too
const BUTTON = `flex size-11 items-center justify-center rounded-full border bg-onyx/55 text-paper transition-colors duration-200 hover:bg-onyx/75 motion-reduce:transition-none ${FOCUS}`;

type Point = { x: number; y: number };
type Gesture =
  | { kind: "press"; id: number; type: string; start: Point; view: View; moved: boolean }
  | { kind: "pinch"; dist: number; mid: Point; view: View };

/**
 * Zoom for one image in the plan / 3D pop-up (PhotoLightbox with `zoomable`). Laptop: a click zooms to 2.5x at that point
 * and a second click goes back; a drag moves the image when it is zoomed; the wheel or trackpad zooms 1x to 4x around the
 * cursor. Phone: a double tap zooms to 2.5x at that point or back; one finger drags; two fingers pinch 1x to 4x. Three
 * buttons bottom right: «+», «−», «⟲». The image never leaves the box (lib/zoom.ts has the rules). It starts at 1x each
 * time it is mounted (the pop-up mounts it when it opens, and it is keyed by the image).
 */
export function ZoomPan({
  children,
  className = "",
  contentClassName = "",
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const view = useRef<View>(IDENTITY);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [max, setMax] = useState(false);
  const [dragging, setDragging] = useState(false);

  const size = () => {
    const r = box.current?.getBoundingClientRect();
    return { left: r?.left ?? 0, top: r?.top ?? 0, width: r?.width ?? 1, height: r?.height ?? 1 };
  };
  const local = (clientX: number, clientY: number): Point => {
    const { left, top } = size();
    return { x: clientX - left, y: clientY - top };
  };

  const apply = (next: View, animate = false) => {
    view.current = next;
    setZoomed(isZoomed(next));
    setMax(atMaxZoom(next));
    const target = layer.current;
    if (!target) return;
    const props = { x: next.x, y: next.y, scale: next.scale };
    if (animate && !prefersReducedMotion())
      gsap.to(target, { ...props, duration: 0.35, ease: CALM_EASE, overwrite: true });
    else {
      gsap.killTweensOf(target);
      gsap.set(target, props);
    }
  };
  const toggleAt = (p: Point) => {
    const { width, height } = size();
    apply(isZoomed(view.current) ? IDENTITY : zoomAt(view.current, CLICK_ZOOM, p.x, p.y, width, height), true);
  };
  const step = (direction: 1 | -1) => {
    const { width, height } = size();
    const scale = stepScale(view.current.scale, direction);
    apply(scale === 1 ? IDENTITY : zoomAt(view.current, scale, width / 2, height / 2, width, height), true);
  };

  useEffect(() => {
    const target = layer.current;
    if (target) gsap.set(target, { transformOrigin: "0 0", x: 0, y: 0, scale: 1 });
    const el = box.current;
    if (!el) return;
    // the wheel needs a non-passive listener to keep the page (and the browser's own zoom on a trackpad pinch) still
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { left, top, width, height } = size();
      const scale = wheelScale(view.current.scale, e.deltaY, e.deltaMode);
      apply(zoomAt(view.current, scale, e.clientX - left, e.clientY - top, width, height));
    };
    const onResize = () => {
      const { width, height } = size();
      apply(clampView(view.current, width, height));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      if (target) gsap.killTweensOf(target);
    };
  }, []);

  const startPinch = () => {
    const [a, b] = [...pointers.current.values()];
    gesture.current = {
      kind: "pinch",
      dist: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      view: view.current,
    };
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = local(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size === 2) {
      startPinch();
      lastTap.current = null;
    } else if (pointers.current.size === 1) {
      gesture.current = {
        kind: "press",
        id: e.pointerId,
        type: e.pointerType,
        start: p,
        view: view.current,
        moved: false,
      };
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = local(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, p);
    const g = gesture.current;
    if (!g) return;
    const { width, height } = size();
    if (g.kind === "pinch" && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const scaled = zoomAt(g.view, (g.view.scale * dist) / g.dist, g.mid.x, g.mid.y, width, height);
      apply(panBy(scaled, mid.x - g.mid.x, mid.y - g.mid.y, width, height));
      return;
    }
    if (g.kind === "press" && g.id === e.pointerId) {
      const dx = p.x - g.start.x;
      const dy = p.y - g.start.y;
      if (!g.moved && Math.hypot(dx, dy) > TAP_SLOP) {
        g.moved = true;
        if (isZoomed(g.view)) setDragging(true);
      }
      if (g.moved && isZoomed(g.view)) apply(panBy(g.view, dx, dy, width, height));
    }
  };

  const onPointerEnd = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = local(e.clientX, e.clientY);
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (g?.kind === "pinch") {
      // one finger left after a pinch: it carries on as a drag from where the image is now (marked moved: no tap)
      const rest = [...pointers.current.entries()][0];
      gesture.current = rest
        ? { kind: "press", id: rest[0], type: "touch", start: rest[1], view: view.current, moved: true }
        : null;
      if (!rest) setDragging(false);
      return;
    }
    gesture.current = null;
    setDragging(false);
    if (cancelled || !g || g.kind !== "press" || g.id !== e.pointerId || g.moved) return;
    if (g.type === "mouse") {
      toggleAt(p);
      return;
    }
    // touch and pen: a double tap
    if (isDoubleTap(lastTap.current, e.timeStamp, p.x, p.y)) {
      lastTap.current = null;
      toggleAt(p);
    } else lastTap.current = { t: e.timeStamp, x: p.x, y: p.y };
  };

  return (
    <div
      ref={box}
      data-zoom={zoomed ? "in" : "out"}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => onPointerEnd(e, false)}
      onPointerCancel={(e) => onPointerEnd(e, true)}
      className={`relative touch-none overflow-hidden ${zoomed ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"} ${className}`}
    >
      <div ref={layer} className={`h-full w-full will-change-transform ${contentClassName}`}>
        {children}
      </div>
      {/* the buttons do not start a gesture on the image */}
      <div className="absolute right-3 bottom-3 z-10 flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label="Зумирај"
          aria-disabled={max}
          onClick={() => !max && step(1)}
          className={BUTTON}
          style={{ borderColor: "color-mix(in srgb, var(--color-copper) 55%, transparent)", opacity: max ? 0.4 : 1 }}
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Одзумирај"
          aria-disabled={!zoomed}
          onClick={() => zoomed && step(-1)}
          className={BUTTON}
          style={{ borderColor: "color-mix(in srgb, var(--color-copper) 55%, transparent)", opacity: zoomed ? 1 : 0.4 }}
        >
          <Minus className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Почетен приказ"
          aria-disabled={!zoomed}
          onClick={() => zoomed && apply(IDENTITY, true)}
          className={BUTTON}
          style={{ borderColor: "color-mix(in srgb, var(--color-copper) 55%, transparent)", opacity: zoomed ? 1 : 0.4 }}
        >
          <RotateCcw className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
        </button>
      </div>
    </div>
  );
}
