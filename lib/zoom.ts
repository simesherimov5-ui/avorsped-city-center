/**
 * Pure rules of the zoom in the plan / 3D pop-up (components/ui/ZoomPan.tsx): kept here so they are tested without a browser.
 *
 * A view is a scale and a move (in px) of the image's layer inside its box, with the transform origin at the box's top
 * left corner. The layer always covers the box: it is never smaller than the box and never moved past its edges.
 */

export type View = { scale: number; x: number; y: number };

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;
/** A click (laptop) or a double tap (phone) zooms to this. */
export const CLICK_ZOOM = 2.5;
/** The «+» and «−» buttons multiply or divide the scale by this. */
export const BUTTON_STEP = 1.5;
/** How fast the wheel zooms: the scale is multiplied by e^(−px × this) for a wheel move of px. */
export const WHEEL_SPEED = 0.002;
/** Two taps closer than this in time (ms) and distance (px) are a double tap. */
export const DOUBLE_TAP_MS = 300;
export const DOUBLE_TAP_PX = 30;
/** A press that moves less than this (px) is a click or a tap, not a drag. */
export const TAP_SLOP = 6;

export const IDENTITY: View = { scale: 1, x: 0, y: 0 };

const zero = (n: number) => (Object.is(n, -0) ? 0 : n);

export const clampScale = (scale: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));

/** Above 1x (with a little room for rounding). */
export const isZoomed = (view: View) => view.scale > MIN_ZOOM + 0.001;
export const atMaxZoom = (view: View) => view.scale >= MAX_ZOOM - 0.001;

/** The view held inside its limits: the scale between 1x and 4x, the layer never moved past the box's edges. */
export function clampView(view: View, width: number, height: number): View {
  const scale = clampScale(view.scale);
  const minX = width - width * scale;
  const minY = height - height * scale;
  return {
    scale,
    x: zero(Math.min(0, Math.max(minX, view.x))),
    y: zero(Math.min(0, Math.max(minY, view.y))),
  };
}

/** Zoom to `scale` keeping the point (px, py) of the box (e.g. under the cursor) where it is, then clamped. */
export function zoomAt(view: View, scale: number, px: number, py: number, width: number, height: number): View {
  const next = clampScale(scale);
  const k = next / view.scale;
  return clampView({ scale: next, x: px - (px - view.x) * k, y: py - (py - view.y) * k }, width, height);
}

/** Move the layer by (dx, dy), clamped to the box's edges. */
export function panBy(view: View, dx: number, dy: number, width: number, height: number): View {
  return clampView({ scale: view.scale, x: view.x + dx, y: view.y + dy }, width, height);
}

/** The scale after a wheel event (deltaMode 0: px, 1: lines, 2: pages), between 1x and 4x. */
export function wheelScale(scale: number, deltaY: number, deltaMode = 0): number {
  const px = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 400 : deltaY;
  return clampScale(scale * Math.exp(-px * WHEEL_SPEED));
}

/** One step of the «+» / «−» buttons; a step down that ends at (or under) 1x is exactly 1x. */
export function stepScale(scale: number, direction: 1 | -1): number {
  const next = direction > 0 ? scale * BUTTON_STEP : scale / BUTTON_STEP;
  return next < MIN_ZOOM + 0.01 ? MIN_ZOOM : clampScale(next);
}

/** Whether a second tap at (x, y) after one at `last` makes a double tap. */
export function isDoubleTap(last: { t: number; x: number; y: number } | null, t: number, x: number, y: number) {
  return !!last && t - last.t <= DOUBLE_TAP_MS && Math.hypot(x - last.x, y - last.y) <= DOUBLE_TAP_PX;
}
