"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { AREA } from "./booking-config";

/** The width of a handle's touch target in px (the CSS variable --thumb is set from it). */
const THUMB = 44;

/** The scale under the track: where the numbers sit. */
const MARKS = [55, 80, 105, 130, 150];

const label = (v: number) => (v >= AREA.max ? `${AREA.max}+` : String(v));

/**
 * The area range: one track with two round handles, built from two overlaid range inputs (no library). The inputs are
 * what the keyboard and screen readers use: each is a native range input, so Tab reaches it and the arrow keys move it
 * by 5 m². The pointer (mouse or finger) is handled on the track itself: it grabs the handle nearest to where it
 * went down, so each handle can be taken even when the two are close, which two stacked 44px targets cannot offer.
 * The handles cannot cross: they stay at least one step (5 m²) apart. «Сè уште не знам» switches the range off
 * ("we will advise"); moving a handle switches it on again.
 */
export function AreaSlider({
  low,
  high,
  unknown,
  onRange,
  onUnknown,
}: {
  low: number;
  high: number;
  unknown: boolean;
  onRange: (low: number, high: number) => void;
  onUnknown: (unknown: boolean) => void;
}) {
  const [top, setTop] = useState<"low" | "high">("high");
  const track = useRef<HTMLDivElement>(null);
  const inputs = useRef<Record<"low" | "high", HTMLInputElement | null>>({ low: null, high: null });
  const grabbed = useRef<"low" | "high" | null>(null);
  const share = (v: number) => (v - AREA.min) / (AREA.max - AREA.min);
  // The handle is `--thumb` wide and its centre travels from half a handle in to half a handle from the far end, so
  // the gold part and the scale use the same arithmetic.
  const at = (v: number) => `calc(var(--thumb) / 2 + (100% - var(--thumb)) * ${share(v)})`;
  const fill: CSSProperties = {
    left: at(low),
    width: `calc((100% - var(--thumb)) * ${share(high) - share(low)})`,
  };

  /** The scale value under a pointer, unsnapped. */
  const rawAt = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (clientX - r.left - THUMB / 2) / (r.width - THUMB)));
    return AREA.min + t * (AREA.max - AREA.min);
  };
  const snap = (v: number) => Math.round(v / AREA.step) * AREA.step;
  /** Moves a handle to a value, never past the other one and never off the scale. */
  const move = (which: "low" | "high", v: number) => {
    if (which === "low") onRange(Math.max(AREA.min, Math.min(snap(v), high - AREA.step)), high);
    else onRange(low, Math.min(AREA.max, Math.max(snap(v), low + AREA.step)));
    onUnknown(false);
  };
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const raw = rawAt(e.clientX);
    const which = Math.abs(raw - low) <= Math.abs(raw - high) ? "low" : "high";
    grabbed.current = which;
    setTop(which);
    e.currentTarget.setPointerCapture(e.pointerId);
    inputs.current[which]?.focus({ preventScroll: true });
    move(which, raw);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (grabbed.current) move(grabbed.current, rawAt(e.clientX));
  };
  const onUp = () => {
    grabbed.current = null;
  };

  return (
    <div className="ct-area" style={{ "--thumb": `${THUMB}px` } as CSSProperties}>
      <div className="ct-area-read" aria-live="polite">
        {unknown ? "Ќе советуваме" : `${low} – ${label(high)} m²`}
      </div>
      <div className={unknown ? "ct-area-ends is-off" : "ct-area-ends"} aria-hidden>
        <span>ОД · {low} m²</span>
        <span>ДО · {label(high)} m²</span>
      </div>

      <div
        ref={track}
        className={unknown ? "ct-range is-off" : "ct-range"}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="ct-range-track" aria-hidden />
        <div className="ct-range-fill" aria-hidden style={fill} />
        <input
          ref={(el) => {
            inputs.current.low = el;
          }}
          type="range"
          className="ct-range-input"
          style={{ zIndex: top === "low" ? 3 : 2 }}
          min={AREA.min}
          max={AREA.max}
          step={AREA.step}
          value={low}
          aria-label="Површина од"
          aria-valuetext={`${low} m²`}
          onFocus={() => setTop("low")}
          onChange={(e) => {
            onRange(Math.min(Number(e.target.value), high - AREA.step), high);
            onUnknown(false);
          }}
        />
        <input
          ref={(el) => {
            inputs.current.high = el;
          }}
          type="range"
          className="ct-range-input"
          style={{ zIndex: top === "high" ? 3 : 2 }}
          min={AREA.min}
          max={AREA.max}
          step={AREA.step}
          value={high}
          aria-label="Површина до"
          aria-valuetext={`${label(high)} m²`}
          onFocus={() => setTop("high")}
          onChange={(e) => {
            onRange(low, Math.max(Number(e.target.value), low + AREA.step));
            onUnknown(false);
          }}
        />
      </div>
      <div className="ct-range-scale" aria-hidden>
        {MARKS.map((m) => (
          <span key={m} style={{ left: at(m) }}>
            {label(m)}
          </span>
        ))}
      </div>
    </div>
  );
}
