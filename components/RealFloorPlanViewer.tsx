"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Minus, Maximize2, X, ArrowRight } from "lucide-react";
import type { Apartment, MediaImage, PlanRegion } from "@/types";
import { formatArea, formatPrice, statusLabel, typeLabel } from "@/lib/format";
import { DOT_COLOR } from "@/components/ui/StatusBadge";
import { ZoomNavLink } from "@/components/ui/ZoomTransition";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/cn";

const CARD_W = 196;
const CARD_H = 138;
const CARD_GAP = 14;

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), Math.max(min, max));
}

/**
 * Where the floating apartment card should sit relative to the region it
 * describes — preferring the side with room, so it never covers the region
 * itself or spills past the viewer's edge. Computed from the region's
 * percentage position against the container's actual pixel size, which is
 * exact at the default zoom and a close, stable estimate once zoomed (the
 * container's own box doesn't change size with zoom, only its content
 * scales) — good enough for "near the apartment", not claimed as exact.
 */
function cardPlacement(
  r: { x: number; y: number; width: number; height: number },
  containerW: number,
  containerH: number
) {
  const left = (r.x / 100) * containerW;
  const top = (r.y / 100) * containerH;
  const right = left + (r.width / 100) * containerW;
  const bottom = top + (r.height / 100) * containerH;

  if (right + CARD_GAP + CARD_W <= containerW) {
    return { x: right + CARD_GAP, y: clamp(top, 8, containerH - CARD_H - 8) };
  }
  if (left - CARD_GAP - CARD_W >= 0) {
    return { x: left - CARD_GAP - CARD_W, y: clamp(top, 8, containerH - CARD_H - 8) };
  }
  if (bottom + CARD_GAP + CARD_H <= containerH) {
    return { x: clamp(left, 8, containerW - CARD_W - 8), y: bottom + CARD_GAP };
  }
  return { x: clamp(left, 8, containerW - CARD_W - 8), y: Math.max(top - CARD_GAP - CARD_H, 8) };
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

type RegionApartment = Apartment & { realPlanRegion: NonNullable<Apartment["realPlanRegion"]> };

interface RealFloorPlanViewerProps {
  image: MediaImage;
  /** Natural pixel dimensions of `image`, used only to keep the viewer's aspect ratio exact — never to resize/distort the drawing. */
  imageWidth: number;
  imageHeight: number;
  /** Omit for a pure zoom/pan document viewer with no apartment overlay (e.g. the official-plan section). */
  apartments?: RegionApartment[];
  /**
   * Percentage sub-rect of the *source scan* to frame by default (e.g. the
   * drawing itself, excluding a printed title block or room-schedule table
   * that's part of the same page). This never crops or re-renders the source
   * file — the full image still loads, still zooms/pans, and the "official
   * documentation" viewer always shows it uncropped; this only changes what
   * the *interactive* viewer frames by default, since a buyer selecting an
   * apartment doesn't need a printed spec table sharing the view. Omit for
   * floors whose scan has no such extra content.
   */
  focusRegion?: PlanRegion;
}

export function RealFloorPlanViewer({
  image,
  imageWidth,
  imageHeight,
  apartments = [],
  focusRegion,
}: RealFloorPlanViewerProps) {
  const fx = focusRegion?.x ?? 0;
  const fy = focusRegion?.y ?? 0;
  const fw = focusRegion?.width ?? 100;
  const fh = focusRegion?.height ?? 100;
  /** Remaps a region from full-page percentage space into the focused frame's percentage space. Identity when there's no focusRegion. */
  function toFocusPct(r: PlanRegion) {
    return {
      x: ((r.x - fx) / fw) * 100,
      y: ((r.y - fy) / fh) * 100,
      width: (r.width / fw) * 100,
      height: (r.height / fh) * 100,
    };
  }

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragState = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const pinchState = useRef<{ distance: number; zoom: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const regionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // Measured (not read from the ref during render — refs aren't reactive
  // state, so React has no way to know when to re-render off them) purely so
  // the floating card's position tracks the viewer's actual box, including
  // when it resizes.
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentBoxSize?.[0];
      setContainerSize(
        box ? { width: box.inlineSize, height: box.blockSize } : { width: el.clientWidth, height: el.clientHeight }
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const selected = apartments.find((a) => a.id === selectedId) ?? null;
  // While something is selected, hovering a *different* unit still shows a
  // quick preview; hovering the selected one would just repeat its own card.
  const hovered = hoveredId && hoveredId !== selectedId ? (apartments.find((a) => a.id === hoveredId) ?? null) : null;
  // The card shows whichever is more specific: an active hover wins over the
  // standing selection, so glancing at a neighbor never fights the open card.
  const cardApartment = hovered ?? selected;
  const cardRegion = cardApartment ? toFocusPct(cardApartment.realPlanRegion) : null;
  const cardPos =
    cardRegion && containerSize.width > 0 ? cardPlacement(cardRegion, containerSize.width, containerSize.height) : null;

  function clampPan(next: { x: number; y: number }, z: number) {
    if (z <= 1) return { x: 0, y: 0 };
    const el = containerRef.current;
    if (!el) return next;
    const maxX = (el.clientWidth * (z - 1)) / 2;
    const maxY = (el.clientHeight * (z - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }

  function zoomTo(next: number) {
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    setZoom(z);
    setPan((p) => clampPan(p, z));
  }

  function reset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function onPointerDown(e: React.PointerEvent) {
    if (zoom <= 1) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setIsInteracting(true);
    dragState.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPan(clampPan({ x: dragState.current.panX + dx, y: dragState.current.panY + dy }, zoom));
  }

  function onPointerUp() {
    dragState.current = null;
    setIsInteracting(false);
  }

  function touchDistance(touches: React.TouchList) {
    const [a, b] = [touches[0], touches[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      setIsInteracting(true);
      pinchState.current = { distance: touchDistance(e.touches), zoom };
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && pinchState.current) {
      e.preventDefault();
      const ratio = touchDistance(e.touches) / pinchState.current.distance;
      zoomTo(pinchState.current.zoom * ratio);
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) {
      pinchState.current = null;
      setIsInteracting(false);
    }
  }

  return (
    <div>
      <div className="relative border border-line bg-warm-white">
        <div
          ref={containerRef}
          className={cn(
            "relative w-full touch-pan-y select-none overflow-hidden bg-cream",
            zoom > 1 && "cursor-grab active:cursor-grabbing touch-none"
          )}
          style={{ aspectRatio: `${(imageWidth * fw) / 100} / ${(imageHeight * fh) / 100}` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onDoubleClick={() => zoomTo(zoom > 1 ? 1 : 2)}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ x: pan.x, y: pan.y, scale: zoom }}
            // Direct manipulation (drag, pinch) must track the pointer with zero
            // lag — animating those updates makes a drag feel like it's dragging
            // through syrup. A tween only applies to programmatic changes: zoom
            // buttons, reset, double-tap.
            transition={isInteracting ? { duration: 0 } : { type: "tween", duration: DURATION.base, ease: EASE }}
            style={{ transformOrigin: "50% 50%" }}
          >
            {/* Layer A — the official architectural drawing, at native resolution and
                proportions. When focusRegion is set, the same full image is rendered
                oversized and offset so the focus rect exactly fills the frame — a
                crop of the *view*, not of the file. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{
                width: `${10000 / fw}%`,
                height: `${10000 / fh}%`,
                left: `${(-100 * fx) / fw}%`,
                top: `${(-100 * fy) / fh}%`,
              }}
            />

            {/* Layer B — the interactive apartment overlay, aligned to Layer A by
                percentage regions. Regions are calibrated approximations (no
                CAD source exists), so the highlight is deliberately a corner
                bracket rather than a hard rectangle — it reads as "roughly
                here", not as a traced wall, and never pretends to more
                precision than the source supports. */}
            {apartments.map((apt) => {
              const r = toFocusPct(apt.realPlanRegion);
              const isHovered = hoveredId === apt.id;
              const isSelected = selectedId === apt.id;
              const unavailable = apt.status !== "available";
              return (
                <button
                  key={apt.id}
                  ref={(el) => {
                    regionRefs.current[apt.id] = el;
                  }}
                  type="button"
                  aria-label={`Стан ${apt.number} — детали`}
                  aria-pressed={isSelected}
                  className="focus-ring absolute"
                  style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.width}%`, height: `${r.height}%` }}
                  onMouseEnter={() => setHoveredId(apt.id)}
                  onMouseLeave={() => setHoveredId((current) => (current === apt.id ? null : current))}
                  onFocus={() => setHoveredId(apt.id)}
                  onBlur={() => setHoveredId((current) => (current === apt.id ? null : current))}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId((current) => (current === apt.id ? null : apt.id));
                  }}
                >
                  {/* Soft architectural wash — never a heavy color fill. */}
                  <span
                    className={cn(
                      "absolute inset-0 transition-colors duration-150",
                      isSelected
                        ? "bg-accent/[0.14]"
                        : isHovered
                          ? "bg-accent/[0.07]"
                          : unavailable
                            ? "bg-ink/[0.025]"
                            : "bg-transparent"
                    )}
                    style={isSelected ? { boxShadow: "inset 0 0 0 1px rgba(184,150,46,0.45)" } : undefined}
                  />

                  {/* Corner brackets, counter-scaled to a constant on-screen size
                      regardless of zoom — an exhibition-label motif, not a
                      selection box. */}
                  {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                    <span
                      key={corner}
                      aria-hidden
                      className={cn(
                        "absolute h-3 w-3 transition-colors duration-150",
                        corner === "tl" && "left-0 top-0 origin-top-left border-l-[1.5px] border-t-[1.5px]",
                        corner === "tr" && "right-0 top-0 origin-top-right border-r-[1.5px] border-t-[1.5px]",
                        corner === "bl" && "bottom-0 left-0 origin-bottom-left border-b-[1.5px] border-l-[1.5px]",
                        corner === "br" && "bottom-0 right-0 origin-bottom-right border-b-[1.5px] border-r-[1.5px]",
                        isSelected ? "border-accent" : isHovered ? "border-accent/80" : "border-charcoal/0"
                      )}
                      style={{ transform: `scale(${1 / zoom})` }}
                    />
                  ))}

                  {/* Counter-scaled so the number reads at a constant size regardless of zoom. */}
                  <span
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ transform: `translate(-50%, -50%) scale(${1 / zoom})` }}
                  >
                    <span
                      className={cn(
                        "flex h-6 min-w-6 items-center justify-center whitespace-nowrap rounded-full border px-1.5 text-[11px] font-semibold shadow-sm transition-colors duration-150",
                        isSelected || isHovered
                          ? "border-accent bg-accent text-chrome"
                          : "border-charcoal/20 bg-warm-white/90 text-charcoal/70"
                      )}
                    >
                      {apt.number}
                    </span>
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* The one apartment card, hover or selected — anchored beside the
            region it describes (never on top of it, never off the edge of
            the viewer) instead of a fixed corner, so the plan and the card
            read as one object. Hidden below sm: the touch equivalent is the
            bottom sheet, where "near the apartment" isn't meaningful on a
            small screen. */}
        <AnimatePresence>
          {cardApartment && cardPos && (
            <motion.div
              key={cardApartment.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: DURATION.fast, ease: EASE }}
              style={{ left: cardPos.x, top: cardPos.y, width: CARD_W }}
              className={cn(
                "pointer-events-none absolute z-20 hidden border bg-warm-white/95 px-4 py-3 shadow-[0_16px_32px_-18px_rgba(27,26,24,0.4)] backdrop-blur-sm sm:block",
                selectedId === cardApartment.id ? "border-accent/50" : "border-line"
              )}
            >
              <div className="eyebrow text-gold-deep">Стан {cardApartment.number}</div>
              <div className="mt-1.5 font-display text-xl text-charcoal">{formatArea(cardApartment.area)}</div>
              <div className="mt-1 text-xs text-muted">
                {cardApartment.bedrooms} {cardApartment.bedrooms === 1 ? "спална" : "спални"} ·{" "}
                {cardApartment.bathrooms} {cardApartment.bathrooms === 1 ? "бања" : "бањи"}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-ink/70">
                <span className={cn("h-1.5 w-1.5 rounded-full", DOT_COLOR[cardApartment.status])} />
                {statusLabel(cardApartment.status)}
              </div>
              {selectedId === cardApartment.id && (
                <div className="pointer-events-auto mt-3 flex items-center gap-2 border-t border-line pt-3">
                  <ZoomNavLink
                    href={`/apartments/${cardApartment.id}`}
                    label={`Стан ${cardApartment.number}`}
                    originRect={() => {
                      const el = regionRefs.current[cardApartment.id];
                      return el ? el.getBoundingClientRect() : null;
                    }}
                    className="focus-ring group flex flex-1 items-center justify-center gap-1.5 border border-charcoal/25 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal transition-colors hover:border-charcoal"
                  >
                    Погледни
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </ZoomNavLink>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Затвори"
                    className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center text-muted hover:text-charcoal"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoom controls — unobtrusive, fixed to the viewer's own corner regardless of pan/zoom. */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => zoomTo(zoom + 0.6)}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Зумирај"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line bg-warm-white text-charcoal shadow-sm transition-colors hover:border-accent active:scale-90 disabled:opacity-30 disabled:active:scale-100"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => zoomTo(zoom - 0.6)}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Одзумирај"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line bg-warm-white text-charcoal shadow-sm transition-colors hover:border-accent active:scale-90 disabled:opacity-30 disabled:active:scale-100"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label="Прикажи ја целата основа"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line bg-warm-white text-charcoal shadow-sm transition-colors hover:border-accent active:scale-90"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {apartments.length > 0 && (
          <p className="pointer-events-none absolute left-3 top-3 hidden text-[11px] text-muted sm:block">
            Задржете го покажувачот или кликнете на стан
          </p>
        )}
      </div>

      {/* Mobile — bottom sheet, since a floating card anchored to a small
          touch region isn't meaningful at this size; a sheet also matches
          how the rest of the site handles mobile contextual panels. */}
      <div className="sm:hidden">
        <AnimatePresence>
          {selected && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-chrome/40"
                onClick={() => setSelectedId(null)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: DURATION.slow, ease: EASE }}
                className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-warm-white p-6 pb-8 shadow-[0_-12px_32px_rgba(0,0,0,0.12)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selected.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: DURATION.fast }}
                    >
                      <ApartmentSummary apartment={selected} />
                    </motion.div>
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Затвори"
                    className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center text-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <ZoomNavLink
                  href={`/apartments/${selected.id}`}
                  label={`Стан ${selected.number}`}
                  originRect={() => {
                    const el = regionRefs.current[selected.id];
                    return el ? el.getBoundingClientRect() : null;
                  }}
                  className="focus-ring mt-5 flex items-center justify-center gap-2 border border-chrome bg-chrome px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-on-chrome active:scale-[0.98]"
                >
                  Погледни го станот <ArrowRight className="h-3.5 w-3.5" />
                </ZoomNavLink>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ApartmentSummary({ apartment }: { apartment: Apartment }) {
  return (
    <div>
      <div className="eyebrow text-gold-deep">Стан {apartment.number}</div>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-2xl">{formatArea(apartment.area)}</span>
        <span className="text-sm text-muted">
          {typeLabel(apartment.type)} · {apartment.bedrooms} {apartment.bedrooms === 1 ? "спална соба" : "спални соби"}{" "}
          · {apartment.bathrooms} {apartment.bathrooms === 1 ? "бања" : "бањи"}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className={cn("h-2 w-2 rounded-full", DOT_COLOR[apartment.status])} />
        <span className="text-ink/70">{statusLabel(apartment.status)}</span>
        <span className="text-line">·</span>
        <span className="font-medium text-charcoal">{formatPrice(apartment.price)}</span>
      </div>
    </div>
  );
}
