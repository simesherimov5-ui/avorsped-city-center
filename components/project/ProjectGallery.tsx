"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { Modal } from "@/components/ui/Modal";
import { Reveal } from "@/components/ui/Reveal";
import { getLenis } from "@/lib/lenis";
import { useMediaQuery } from "@/lib/useMediaQuery";

type Photo = { src: string; alt: string; isPlaceholder: boolean };

const pad = (n: number) => String(n).padStart(2, "0");
const SWIPE_PX = 50;

/**
 * «ГАЛЕРИЈА» of a photo-led project page, on Оникс: the heading and a counter, then a row of 16:9 photos that starts at
 * the content's edge and snaps photo by photo, the next one peeking in (72vw, at most 1100px; 88vw on a phone). From
 * 768px ← → buttons move it (and ← → keys while it has focus); a phone swipes it natively. Under it a hairline with a gold
 * stretch shows where the row is. A photo opens in a full-screen viewer (the site's Modal: focus trapped and given back,
 * Esc, the page locked), with ← → keys, buttons and swipe. With a mouse a photo grows a little under the pointer.
 */
export function ProjectGallery({ photos }: { photos: Photo[] }) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const track = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const count = photos.length;

  // the photo the row rests on: the one whose left edge is nearest the row's start (where it snaps)
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const start = el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft);
      let nearest = 0;
      let distance = Infinity;
      [...el.children].forEach((li, i) => {
        const d = Math.abs(li.getBoundingClientRect().left - start);
        if (d < distance) {
          distance = d;
          nearest = i;
        }
      });
      setCurrent(nearest);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToPhoto = (i: number) => {
    const el = track.current;
    const li = el?.children[Math.max(0, Math.min(count - 1, i))] as HTMLElement | undefined;
    if (!el || !li) return;
    el.scrollTo({
      left: li.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft),
      behavior: reduce ? "auto" : "smooth",
    });
  };
  const onTrackKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollToPhoto(current + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollToPhoto(current - 1);
    }
  };

  return (
    <section aria-label="Галерија" className="grain grain--dark bg-onyx py-20 text-paper md:py-[120px]">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-end justify-between gap-6 px-[5%]">
        <Reveal>
          <div className="eyebrow tracking-[0.32em] text-gold">ГАЛЕРИЈА</div>
          <h2 className="m-0 mt-4 font-display text-[clamp(40px,4.8vw,72px)] font-normal leading-[1.05] text-paper">
            Погледнете го проектот.
          </h2>
        </Reveal>
        <div className="flex items-center gap-4">
          <span className="text-label tracking-[0.3em] text-paper/85" aria-hidden>
            {pad(current + 1)} / {pad(count)}
          </span>
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollToPhoto(current - 1)}
              disabled={current === 0}
              aria-label="Претходна фотографија"
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 text-paper transition-colors hover:border-paper disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToPhoto(current + 1)}
              disabled={current === count - 1}
              aria-label="Следна фотографија"
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 text-paper transition-colors hover:border-paper disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={track}
        tabIndex={0}
        aria-label={`Фотографии од проектот, ${count}`}
        onKeyDown={onTrackKey}
        className="pg-track no-scrollbar focus-ring m-0 mt-12 flex list-none gap-6 overflow-x-auto p-0"
      >
        {photos.map((photo, i) => (
          <li key={photo.src} className="pg-slide flex-none">
            <button
              type="button"
              onClick={() => setViewer(i)}
              aria-label={`Отвори ја фотографијата ${i + 1} од ${count}: ${photo.alt}`}
              className="focus-ring group block aspect-video w-full overflow-hidden bg-espresso"
            >
              <span className="block h-full w-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.03] motion-reduce:group-hover:scale-100">
                <Media
                  image={photo}
                  tone="dark"
                  alwaysCover
                  className="h-full w-full !bg-transparent"
                  sizes="(max-width: 767px) 88vw, min(72vw, 1100px)"
                />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-8 max-w-[1320px] px-[5%]">
        <div aria-hidden className="relative h-px bg-paper/20">
          <span
            className="absolute inset-y-0 left-0 bg-gold transition-transform duration-300 motion-reduce:transition-none"
            style={{ width: `${100 / count}%`, transform: `translateX(${current * 100}%)` }}
          />
        </div>
      </div>

      <GalleryViewer photos={photos} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />
    </section>
  );
}

/** The full-screen viewer: the photo whole on Оникс (96%), its number, ← → buttons, keys and swipe. */
function GalleryViewer({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: Photo[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const count = photos.length;
  const swipe = useRef<number | null>(null);
  const open = index !== null;
  const go = (dir: 1 | -1) => index !== null && onIndex((index + dir + count) % count);
  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
  });
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "ArrowRight") goRef.current(1);
      else if (e.key === "ArrowLeft") goRef.current(-1);
    };
    window.addEventListener("keydown", onKey);
    // the page's smooth scroll stands still while the viewer is open
    const lenis = getLenis();
    lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open]);
  const photo = index !== null ? photos[index] : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      label="Фотографии од проектот"
      overlay={0.96}
      closeIn="screen"
      className="w-full"
    >
      {photo && (
        <div
          className="flex flex-col items-center gap-4 px-4"
          onPointerDown={(e: PointerEvent) => (swipe.current = e.clientX)}
          onPointerUp={(e: PointerEvent) => {
            const start = swipe.current;
            swipe.current = null;
            if (start !== null && Math.abs(e.clientX - start) > SWIPE_PX) go(e.clientX < start ? 1 : -1);
          }}
        >
          <div className="relative h-[min(78svh,56.25vw)] w-[min(92vw,1672px)]">
            <Media
              key={photo.src}
              image={photo}
              tone="dark"
              fit="contain"
              className="h-full w-full !bg-transparent"
              sizes="92vw"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Претходна фотографија"
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 text-paper"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-label tracking-[0.3em] text-paper/85" aria-live="polite">
              {pad(index! + 1)} / {pad(count)}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Следна фотографија"
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 text-paper"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
