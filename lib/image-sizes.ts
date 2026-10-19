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
