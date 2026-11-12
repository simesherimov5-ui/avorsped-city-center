"use client";

import { useState } from "react";
import { PhotoLightbox, type LightboxPhoto } from "@/components/ui/PhotoLightbox";

const TITLE = "Комплексот низ фотографии";

/**
 * «Фотографии од комплексот»: a button (a secondary one, under the card of the chosen building) that opens the photos of the
 * whole complex in the shared photo pop-up (components/ui/PhotoLightbox.tsx: the «Галерија» motion, the strip, the counter,
 * the caption, the thumbnails; the Modal's dark backdrop, scroll lock, focus trap, Esc and focus return). It opens from a
 * button, so the frame fades and scales in. The pop-up is in a portal, so opening and closing it changes nothing on the page.
 */
export function ProjectPhotoGallery({ photos }: { photos: LightboxPhoto[] }) {
  const [open, setOpen] = useState(false);
  if (photos.length === 0) return null;

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="focus-ring flex min-h-11 w-full items-center justify-center border border-line px-5 text-label font-semibold uppercase tracking-label text-ink/80 transition-colors duration-200 hover:border-ink/40 hover:text-ink motion-reduce:transition-none"
      >
        Фотографии од комплексот
      </button>
      <PhotoLightbox photos={photos} open={open} label={TITLE} slowOpen onClose={() => setOpen(false)} />
    </>
  );
}
