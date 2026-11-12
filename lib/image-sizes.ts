import type { PhotoBox } from "@/types";
import { IMAGE_DIMS } from "./image-dims";

/** A photo's proportions (width / height), from lib/image-dims.ts; undefined for a file that is not listed. */
export function aspectOf(src: string): number | undefined {
  const d = IMAGE_DIMS[src];
  return d ? d[0] / d[1] : undefined;
}

/** Below this, a photo counts as square or portrait: in a wide frame it is shown whole (see Media). */
export const NARROW_PHOTO = 1.2;

export const isNarrowPhoto = (src: string) => {
  const a = aspectOf(src);
  return a !== undefined && a < NARROW_PHOTO;
};

/** One layout of a frame: its width and height as CSS lengths (vw, vh, px, or a max()/min() of them). */
export type Frame = { media?: string; w: string; h: string };

/**
 * The `sizes` of a photo that covers a frame (object-fit: cover). Covering, the photo is drawn
 * max(frame width, frame height × the photo's width / height) wide, so that is what the browser has to fetch; a
 * plain "100vw" is far too small for a wide photo in a tall frame (a phone hero). Give one Frame per layout, the
 * last one without `media`. A photo that is not in lib/image-dims.ts is taken as 16:9.
 */
export function coverSizes(src: string, frames: Frame[]): string {
  const a = (aspectOf(src) ?? 16 / 9).toFixed(3);
  return frames
    .map((f) => {
      const value = `max(${f.w}, ${f.h} * ${a})`;
      return f.media ? `${f.media} ${value}` : value;
    })
    .join(", ");
}

/** A percentage as a fraction for CSS, without float noise (67.1 → "0.671"). */
export const percentToFraction = (percent: number) => String(+(percent / 100).toFixed(4));

/** One layout of a frame for a photo placed by its building box: a Frame with its `media` and `top`, the CSS length the box stays under. */
export type BoxFrame = Frame & { media: string; top: string; bottom?: string };

/**
 * The `sizes` of a photo placed by its building box (Media's `box`, .media-box in globals.css): the width the layout
 * draws it at, min(the cover width, the frame width ÷ the box's width, (the frame height − top) × the photo's width /
 * height ÷ the box's height), one BoxFrame per layout, then `fallback` for every other layout.
 */
export function boxSizes(src: string, box: PhotoBox, frames: BoxFrame[], fallback = "100vw"): string {
  const a = (aspectOf(src) ?? 16 / 9).toFixed(4);
  const value = (f: BoxFrame) =>
    `min(max(${f.w}, ${f.h} * ${a}), ${f.w} / ${percentToFraction(box.w)}, (${f.bottom ? `min(${f.h}, ${f.bottom})` : f.h} - ${f.top}) * ${a} / ${percentToFraction(box.h)})`;
  return [...frames.map((f) => `${f.media} ${value(f)}`), fallback].join(", ");
}

/** The widths the image optimizer accepts (next.config.ts → images.deviceSizes; lib/image-sizes.test.ts checks they match). */
export const OPTIMIZER_WIDTHS: readonly number[] = [640, 750, 828, 1080, 1200, 1600, 1920, 2400, 3200];

/**
 * The width to ask the optimizer for, for a photo that is `maxWidth` pixels wide: a width that is not wider than the file
 * is asked for as it is; a wider one is held at the smallest accepted width that still covers the file (the optimizer
 * refuses a width that is not on its list, such as 1672, and never enlarges a file, so it returns the original size).
 */
export function cappedWidth(width: number, maxWidth: number, allowed: readonly number[] = OPTIMIZER_WIDTHS): number {
  if (width <= maxWidth) return width;
  return allowed.find((w) => w >= maxWidth) ?? allowed[allowed.length - 1];
}

/** One layout of a frame for a photo shown whole: the frame's width, and its height where the photo may be limited by it. */
export type WholeFrame = { media?: string; w: string; h?: string };

/**
 * The `sizes` of a photo shown whole (Media's `whole`, .media-fit in globals.css): min(its own width in pixels, the frame
 * width, the frame height × the photo's width / height), one WholeFrame per layout, the last one without `media`.
 */
export function wholeSizes(src: string, maxWidth: number, frames: WholeFrame[]): string {
  const a = (aspectOf(src) ?? 16 / 9).toFixed(4);
  return frames
    .map((f) => {
      const value = `min(${maxWidth}px, ${f.w}${f.h ? `, (${f.h}) * ${a}` : ""})`;
      return f.media ? `${f.media} ${value}` : value;
    })
    .join(", ");
}
