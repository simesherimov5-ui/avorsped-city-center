/**
 * The mark of the Javor Sped building: a frame, a spine and ten slats on each side, drawn as strokes (no fill) on a
 * 170 × 240 viewBox. The opening draws these one by one (`delay` is when each starts, in seconds); the navbar and the
 * favicon show them all at once. The right slats rest at 60%.
 */
export const MARK_VIEWBOX = "50 60 170 240";

const SLAT_ROWS = Array.from({ length: 10 }, (_, i) => 136 + i * 18);

export const MARK_STROKES: { d: string; delay: number; opacity: number }[] = [
  { d: "M60 300 V70 H110", delay: 0, opacity: 1 },
  { d: "M134 300 V62", delay: 0.05, opacity: 1 },
  ...SLAT_ROWS.flatMap((y, i) => [
    { d: `M70 ${y} L128 ${y - 26}`, delay: i * 0.09, opacity: 1 },
    { d: `M140 ${y - 30} L200 ${y}`, delay: i * 0.09 + 0.05, opacity: 0.6 },
  ]),
];
