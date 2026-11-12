/** Pure rules of the photo pop-up (components/ui/PhotoLightbox.tsx): kept here so they are tested without a browser. */

export type Box = { left: number; top: number; width: number; height: number };

/** The index kept between the first and the last photo (the strip does not loop). */
export const clampIndex = (index: number, count: number) => Math.max(0, Math.min(count - 1, index));

/**
 * The words under a photo: its alt text without the project prefix («City Center — комплексот во зајдисонце» becomes
 * «Комплексот во зајдисонце»), first letter capitalised. No alt text, no caption.
 */
export function captionOf(alt: string | undefined): string {
  const text = (alt ?? "").trim();
  if (!text) return "";
  const split = /^.*?\s+—\s*(.*)$/.exec(text);
  const rest = (split ? split[1] : text).trim();
  if (!rest) return "";
  return rest.charAt(0).toLocaleUpperCase("mk") + rest.slice(1);
}

/** A drag that moves more than this share of the frame's width changes the photo. */
export const DRAG_COMMIT = 0.18;
/** Or one that ends faster than this (px per millisecond). */
export const FLICK_SPEED = 0.45;
/** At the first or last photo the strip follows the finger by this share of the distance. */
export const EDGE_RESISTANCE = 0.3;

/** How far the strip moves for a finger that has moved `dx` px (negative: left, towards the next photo). */
export function dragOffset(dx: number, index: number, count: number): number {
  const towardsMissing = (dx < 0 && index >= count - 1) || (dx > 0 && index <= 0);
  return towardsMissing ? dx * EDGE_RESISTANCE : dx;
}

/** What a released drag does: 1 = next photo, -1 = previous, 0 = snap back. `ms` is how long the drag took. */
export function dragOutcome(dx: number, ms: number, width: number, index: number, count: number): -1 | 0 | 1 {
  if (dx === 0 || width <= 0) return 0;
  const step = dx < 0 ? 1 : -1;
  if (index + step < 0 || index + step > count - 1) return 0;
  const far = Math.abs(dx) > width * DRAG_COMMIT;
  const fast = ms > 0 && Math.abs(dx) / ms > FLICK_SPEED;
  return far || fast ? step : 0;
}

/**
 * The move that puts the photo frame (`to`, its final place) on top of a card (`from`): a translate of the centres and
 * one uniform scale by the widths, so the photo is never stretched or squashed.
 */
export function growTransform(from: Box, to: Box): { x: number; y: number; scale: number } {
  return {
    x: from.left + from.width / 2 - (to.left + to.width / 2),
    y: from.top + from.height / 2 - (to.top + to.height / 2),
    scale: to.width > 0 ? from.width / to.width : 1,
  };
}

/** The card counts as on screen when at least half of it is inside the window. */
export function mostlyOnScreen(box: Box, viewportWidth: number, viewportHeight: number): boolean {
  if (box.width <= 0 || box.height <= 0) return false;
  const w = Math.min(box.left + box.width, viewportWidth) - Math.max(box.left, 0);
  const h = Math.min(box.top + box.height, viewportHeight) - Math.max(box.top, 0);
  return w > 0 && h > 0 && (w * h) / (box.width * box.height) >= 0.5;
}
