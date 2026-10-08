"use client";

import "./projects.css";
import { useRef, useState, type KeyboardEvent, type PointerEvent, type MouseEvent } from "react";
import { ProjectsMapDrawing } from "./ProjectsMapDrawing";
import { useMediaQuery } from "@/lib/useMediaQuery";

export interface MapPin {
  city: string;
  /** "2 ПРОЕКТИ" / "1 ПРОЕКТ" */
  count: string;
  x: number;
  y: number;
}

interface View {
  sc: number;
  tx: number;
  ty: number;
}

const MIN = 1;
const MAX = 4;

/** Keeps the drawing inside its box: it can never be dragged out of it. */
const clamp = (sc: number, tx: number, ty: number, w: number, h: number): View => ({
  sc,
  tx: Math.min(0, Math.max(w * (1 - sc), tx)),
  ty: Math.min(0, Math.max(h * (1 - sc), ty)),
});

/**
 * The schematic map with a pin for every city that has a project. Drag to move (once it is zoomed in; at zoom 1 a
 * vertical swipe still scrolls the page), double-click to zoom at the pointer, the buttons (or + and −) to zoom at the
 * centre, one more to go back. The pins keep their size while the drawing zooms. A click on a pin chooses that city; a
 * click on the chosen one clears it; a drag is never a click.
 */
export function ProjectsMap({
  pins,
  selected,
  onPick,
}: {
  pins: MapPin[];
  selected: string;
  onPick: (city: string) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ sc: 1, tx: 0, ty: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const moved = useRef(false);
  const touch = useMediaQuery("(pointer: coarse)");

  const size = () => {
    const r = box.current!.getBoundingClientRect();
    return { w: r.width, h: r.height, left: r.left, top: r.top };
  };

  const zoomAt = (next: number, px: number, py: number) => {
    const { w, h } = size();
    const sc = Math.max(MIN, Math.min(MAX, next));
    setView((v) => {
      const k = sc / v.sc;
      return clamp(sc, px - (px - v.tx) * k, py - (py - v.ty) * k, w, h);
    });
  };
  const zoomCentre = (factor: number) => {
    const { w, h } = size();
    zoomAt(view.sc * factor, w / 2, h / 2);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // buttons inside the map (pins, zoom) handle themselves; at zoom 1 there is nothing to move
    if ((e.target as HTMLElement).closest(".pj-zoom")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    moved.current = false;
    drag.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
    const { w, h } = size();
    setView((v) => clamp(v.sc, start.tx + dx, start.ty + dy, w, h));
  };
  const onPointerEnd = () => {
    drag.current = null;
    setDragging(false);
    // the click that follows a drag arrives after this; it is ignored by the pins through `moved`
    window.setTimeout(() => {
      moved.current = false;
    }, 0);
  };
  const onDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".pj-zoom")) return;
    const { left, top } = size();
    zoomAt(view.sc * 1.6, e.clientX - left, e.clientY - top);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      zoomCentre(1.4);
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      zoomCentre(1 / 1.4);
    }
  };

  return (
    <div
      ref={box}
      className={`pj-map${view.sc > 1 ? " is-zoomed" : ""}${dragging ? " is-dragging" : ""}`}
      tabIndex={0}
      role="group"
      aria-label="Мапа на проектите"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onPointerLeave={onPointerEnd}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
    >
      <div className="pj-map-layer" style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.sc})` }}>
        <ProjectsMapDrawing />
        {pins.map((pin) => {
          const on = selected === pin.city;
          return (
            <button
              key={pin.city}
              type="button"
              className="pj-pin"
              aria-label={`${pin.city}, ${pin.count.toLowerCase()}`}
              aria-pressed={on}
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: `translate(-13px, -100%) scale(${1 / view.sc})`,
              }}
              onClick={() => {
                if (moved.current) return;
                onPick(on ? "all" : pin.city);
              }}
            >
              <span className="pj-pin-mark">
                <span className="pj-ripple" />
                <svg width="26" height="34" viewBox="0 0 26 34" aria-hidden>
                  <path
                    d="M13 33 C 13 33, 1 20, 1 12.5 A 12 12 0 0 1 25 12.5 C 25 20, 13 33, 13 33 Z"
                    fill={on ? "var(--color-bronze)" : "var(--color-copper)"}
                    stroke="var(--color-bronze)"
                    strokeWidth="1"
                  />
                  <circle cx="13" cy="12.5" r="4.2" fill="var(--color-sand)" />
                </svg>
              </span>
              <span className="pj-pin-text">
                <span className="pj-pin-name">{pin.city}</span>
                <span className="pj-pin-count">{pin.count}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="pj-zoom">
        <button type="button" aria-label="Зумирај" onClick={() => zoomCentre(1.4)}>
          +
        </button>
        <button type="button" aria-label="Одзумирај" onClick={() => zoomCentre(1 / 1.4)}>
          −
        </button>
        <button type="button" aria-label="Почетен приказ" onClick={() => setView({ sc: 1, tx: 0, ty: 0 })}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
        </button>
      </div>
      <div className="pj-hint">Влечете за движење{touch ? "" : " · двоен клик за зум"}</div>
    </div>
  );
}
