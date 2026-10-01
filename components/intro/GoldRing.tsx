import type { Ref } from "react";

/** viewBox units — scaled to actual pixel size via the `size` prop/CSS. */
export const RING_VIEWBOX = 260;
const STROKE_WIDTH = 1;
export const RING_RADIUS = (RING_VIEWBOX - STROKE_WIDTH) / 2 - 4;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const OUTER_RADIUS = RING_RADIUS + 8;

/**
 * The progress ring around the preloader's logo. Presentational only — the
 * main circle's stroke-dashoffset and the tip dot's position are driven
 * imperatively by GSAP in Preloader.tsx, in exact sync with the counter, via
 * the exposed refs, rather than through React state (avoids a re-render on
 * every animation frame).
 */
export function GoldRing({
  circleRef,
  dotRef,
  outerRef,
  className,
}: {
  circleRef?: Ref<SVGCircleElement>;
  dotRef?: Ref<SVGCircleElement>;
  outerRef?: Ref<SVGCircleElement>;
  className?: string;
}) {
  const c = RING_VIEWBOX / 2;

  return (
    <svg
      viewBox={`0 0 ${RING_VIEWBOX} ${RING_VIEWBOX}`}
      className={className}
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="goldRingGradient" x1="0" y1="0" x2={RING_VIEWBOX} y2={RING_VIEWBOX} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8E7240" />
          <stop offset="33%" stopColor="#C9A45C" />
          <stop offset="66%" stopColor="#E6CF9A" />
          <stop offset="100%" stopColor="#C9A45C" />
        </linearGradient>
      </defs>

      {/* Outer ring — dashed depth cue, fully drawn from the start (not a progress indicator). */}
      <circle
        ref={outerRef}
        cx={c}
        cy={c}
        r={OUTER_RADIUS}
        fill="none"
        stroke="#C9A45C"
        strokeOpacity={0.25}
        strokeWidth={0.5}
        strokeDasharray="2 6"
      />

      {/* Main ring — the actual progress indicator, drawn clockwise from 12 o'clock. */}
      <circle
        ref={circleRef}
        cx={c}
        cy={c}
        r={RING_RADIUS}
        fill="none"
        stroke="url(#goldRingGradient)"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
      />

      {/* Glowing tip dot — starts at 12 o'clock, GSAP moves it along the circle. */}
      <circle ref={dotRef} cx={c} cy={c - RING_RADIUS} r={2} fill="#C9A45C" filter="drop-shadow(0 0 4px #C9A45C)" />
    </svg>
  );
}
