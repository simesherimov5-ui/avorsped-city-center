"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Minus, Maximize2, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Apartment, MediaImage } from "@/types";
import { formatArea, formatPrice, statusLabel, typeLabel } from "@/lib/format";
import { DOT_COLOR } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

interface RealFloorPlanViewerProps {
  image: MediaImage;
  /** Natural pixel dimensions of `image`, used only to keep the viewer's aspect ratio exact — never to resize/distort the drawing. */
  imageWidth: number;
  imageHeight: number;
  /** Omit for a pure zoom/pan document viewer with no apartment overlay (e.g. the official-plan section). */
  apartments?: (Apartment & { realPlanRegion: NonNullable<Apartment["realPlanRegion"]> })[];
}

export function RealFloorPlanViewer({ image, imageWidth, imageHeight, apartments = [] }: RealFloorPlanViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragState = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const pinchState = useRef<{ distance: number; zoom: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = apartments.find((a) => a.id === selectedId) ?? null;

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
  }

  function touchDistance(touches: React.TouchList) {
    const [a, b] = [touches[0], touches[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
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
    if (e.touches.length < 2) pinchState.current = null;
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
          style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
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
            transition={{ type: "tween", duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "50% 50%" }}
          >
            {/* Layer A — the official architectural drawing, at native resolution and proportions. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            />

            {/* Layer B — the interactive apartment overlay, aligned to Layer A by percentage regions. */}
            {apartments.map((apt) => {
              const r = apt.realPlanRegion;
              const isHovered = hoveredId === apt.id;
              const isSelected = selectedId === apt.id;
              return (
                <button
                  key={apt.id}
                  type="button"
                  aria-label={`Стан ${apt.number} — детали`}
                  aria-pressed={isSelected}
                  className="focus-ring absolute"
                  style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.width}%`, height: `${r.height}%` }}
                  onMouseEnter={() => setHoveredId(apt.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(apt.id)}
                  onBlur={() => setHoveredId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId((current) => (current === apt.id ? null : apt.id));
                  }}
                >
                  <span
                    className={cn(
                      "block h-full w-full border-2 transition-all duration-200",
                      isSelected
                        ? "border-accent bg-accent/20"
                        : isHovered
                          ? "border-accent/70 bg-accent/10"
                          : apt.status === "available"
                            ? "border-charcoal/0 bg-transparent hover:border-charcoal/20"
                            : "border-transparent bg-ink/[0.03]"
                    )}
                  />

                  {/* Counter-scaled so the label reads at a constant size regardless of zoom. */}
                  <span
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ transform: `translate(-50%, -50%) scale(${1 / zoom})` }}
                  >
                    <span
                      className={cn(
                        "flex h-6 min-w-6 items-center justify-center whitespace-nowrap rounded-full border px-1.5 text-[11px] font-semibold shadow-sm transition-colors",
                        isSelected || isHovered
                          ? "border-accent bg-accent text-charcoal"
                          : "border-charcoal/20 bg-warm-white/90 text-charcoal/70"
                      )}
                    >
                      {apt.number}
                    </span>
                  </span>

                  {/* Hover preview */}
                  <AnimatePresence>
                    {isHovered && !isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap border border-line bg-charcoal px-3 py-2 text-left text-warm-white shadow-lg"
                        style={{ transform: `translateX(-50%) scale(${1 / zoom})`, transformOrigin: "top center" }}
                      >
                        <div className="text-xs font-semibold">Стан {apt.number}</div>
                        <div className="mt-0.5 text-[11px] text-warm-white/70">
                          {formatArea(apt.area)} · {apt.bedrooms} {apt.bedrooms === 1 ? "спална" : "спални"}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-warm-white/70">
                          <span className={cn("h-1.5 w-1.5 rounded-full", DOT_COLOR[apt.status])} />
                          {statusLabel(apt.status)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Zoom controls — unobtrusive, fixed to the viewer's own corner regardless of pan/zoom. */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => zoomTo(zoom + 0.6)}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Зумирај"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line bg-warm-white text-charcoal shadow-sm transition-colors hover:border-accent disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => zoomTo(zoom - 0.6)}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Одзумирај"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line bg-warm-white text-charcoal shadow-sm transition-colors hover:border-accent disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label="Прикажи ја целата основа"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line bg-warm-white text-charcoal shadow-sm transition-colors hover:border-accent"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {apartments.length > 0 && (
          <p className="pointer-events-none absolute left-3 top-3 hidden text-[11px] text-ink/40 sm:block">
            Задржете го покажувачот или кликнете на стан
          </p>
        )}
      </div>

      {/* Desktop — persistent side info panel, mirrors the Masterplan pattern used elsewhere on the site. */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 hidden border border-line bg-warm-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6"
          >
            <ApartmentSummary apartment={selected} />
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={`/apartments/${selected.id}`}
                className="focus-ring group flex items-center gap-2 border border-charcoal/25 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-charcoal transition-colors hover:border-charcoal"
              >
                Погледни го станот
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Затвори"
                className="focus-ring flex h-9 w-9 items-center justify-center text-ink/40 hover:text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile — bottom sheet, since a side panel would compete with the plan for width. */}
      <div className="sm:hidden">
        <AnimatePresence>
          {selected && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-charcoal/40"
                onClick={() => setSelectedId(null)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-warm-white p-6 pb-8 shadow-[0_-12px_32px_rgba(0,0,0,0.12)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <ApartmentSummary apartment={selected} />
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Затвори"
                    className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center text-ink/40"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Link
                  href={`/apartments/${selected.id}`}
                  className="focus-ring mt-5 flex items-center justify-center gap-2 border border-charcoal bg-charcoal px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-warm-white"
                >
                  Погледни го станот <ArrowRight className="h-3.5 w-3.5" />
                </Link>
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
      <div className="eyebrow text-accent">Стан {apartment.number}</div>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-2xl">{formatArea(apartment.area)}</span>
        <span className="text-sm text-ink/60">
          {typeLabel(apartment.type)} · {apartment.bedrooms} {apartment.bedrooms === 1 ? "спална соба" : "спални соби"}
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
