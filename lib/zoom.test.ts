import { describe, expect, it } from "vitest";
import {
  CLICK_ZOOM,
  IDENTITY,
  MAX_ZOOM,
  atMaxZoom,
  clampView,
  isDoubleTap,
  isZoomed,
  panBy,
  stepScale,
  wheelScale,
  zoomAt,
} from "./zoom";

const W = 800;
const H = 500;

describe("zoomAt", () => {
  it("keeps the clicked point under the cursor", () => {
    const v = zoomAt(IDENTITY, CLICK_ZOOM, 200, 100, W, H);
    expect(v.scale).toBe(2.5);
    // the image point under (200, 100) before the zoom is still under it after
    expect((200 - v.x) / v.scale).toBeCloseTo(200);
    expect((100 - v.y) / v.scale).toBeCloseTo(100);
  });

  it("is clamped at the edges when zooming at a corner", () => {
    const v = zoomAt(IDENTITY, CLICK_ZOOM, 0, 0, W, H);
    expect(v).toEqual({ scale: 2.5, x: 0, y: 0 });
    const w = zoomAt(IDENTITY, CLICK_ZOOM, W, H, W, H);
    expect(w.x).toBeCloseTo(W - W * 2.5);
    expect(w.y).toBeCloseTo(H - H * 2.5);
  });

  it("never goes under 1x or over 4x", () => {
    expect(zoomAt(IDENTITY, 0.3, 100, 100, W, H)).toEqual(IDENTITY);
    expect(zoomAt(IDENTITY, 9, 100, 100, W, H).scale).toBe(MAX_ZOOM);
  });

  it("back to 1x puts the image back in place", () => {
    const zoomed = zoomAt(IDENTITY, 3, 600, 400, W, H);
    expect(zoomAt(zoomed, 1, 300, 200, W, H)).toEqual(IDENTITY);
  });
});

describe("panBy and clampView", () => {
  it("does nothing at 1x", () => {
    expect(panBy(IDENTITY, 120, -80, W, H)).toEqual(IDENTITY);
  });

  it("cannot drag past the edges", () => {
    const v = { scale: 2, x: -400, y: -250 };
    expect(panBy(v, 10_000, 10_000, W, H)).toEqual({ scale: 2, x: 0, y: 0 });
    expect(panBy(v, -10_000, -10_000, W, H)).toEqual({ scale: 2, x: -800, y: -500 });
    expect(panBy(v, 50, -30, W, H)).toEqual({ scale: 2, x: -350, y: -280 });
  });

  it("re-clamps a view after the box got smaller", () => {
    expect(clampView({ scale: 2, x: -800, y: -500 }, 400, 250)).toEqual({ scale: 2, x: -400, y: -250 });
  });
});

describe("wheelScale", () => {
  it("zooms in on a wheel up and out on a wheel down, between 1x and 4x", () => {
    expect(wheelScale(1, -100)).toBeGreaterThan(1);
    expect(wheelScale(2, 100)).toBeLessThan(2);
    expect(wheelScale(1, 500)).toBe(1);
    expect(wheelScale(3.9, -5000)).toBe(MAX_ZOOM);
  });

  it("treats line and page deltas as larger moves", () => {
    expect(wheelScale(1, -3, 1)).toBeCloseTo(wheelScale(1, -48, 0));
    expect(wheelScale(1, -1, 2)).toBeCloseTo(wheelScale(1, -400, 0));
  });
});

describe("stepScale", () => {
  it("steps by 1.5 and lands exactly on 1x and 4x", () => {
    expect(stepScale(1, 1)).toBe(1.5);
    expect(stepScale(1.5, -1)).toBe(1);
    expect(stepScale(1.2, -1)).toBe(1);
    expect(stepScale(3.375, 1)).toBe(MAX_ZOOM);
  });
});

describe("isZoomed, atMaxZoom", () => {
  it("reads the view", () => {
    expect(isZoomed(IDENTITY)).toBe(false);
    expect(isZoomed({ scale: 1.2, x: 0, y: 0 })).toBe(true);
    expect(atMaxZoom({ scale: 4, x: 0, y: 0 })).toBe(true);
    expect(atMaxZoom({ scale: 3.5, x: 0, y: 0 })).toBe(false);
  });
});

describe("isDoubleTap", () => {
  it("needs two taps close in time and place", () => {
    expect(isDoubleTap(null, 100, 10, 10)).toBe(false);
    expect(isDoubleTap({ t: 0, x: 10, y: 10 }, 250, 20, 15)).toBe(true);
    expect(isDoubleTap({ t: 0, x: 10, y: 10 }, 400, 10, 10)).toBe(false);
    expect(isDoubleTap({ t: 0, x: 10, y: 10 }, 200, 80, 10)).toBe(false);
  });
});
