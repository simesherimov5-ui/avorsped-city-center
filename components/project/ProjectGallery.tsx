"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { PhotoLightbox } from "@/components/ui/PhotoLightbox";
import { Reveal } from "@/components/ui/Reveal";
import { useMediaQuery } from "@/lib/useMediaQuery";

type Photo = { src: string; alt: string; isPlaceholder: boolean };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * «ГАЛЕРИЈА» of a photo-led project page, on Оникс: the heading and a counter, then a row of 16:9 photos that starts at
 * the content's edge and snaps photo by photo, the next one peeking in (72vw, at most 1100px; 88vw on a phone). From
 * 768px ← → buttons move it (and ← → keys while it has focus); a phone swipes it natively. Under it a hairline with a gold
 * stretch shows where the row is. A photo opens in the shared photo pop-up (PhotoLightbox: it grows from the card and shrinks back into it; the Modal's
 * focus trap and focus return, Esc, the page locked), with ← → keys, buttons, thumbnails and drag. With a mouse a photo grows a little under the pointer.
 */
export function ProjectGallery({ photos }: { photos: Photo[] }) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const track = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);
  // the photo the pop-up shows and the card it grew from (kept while it closes, so it can shrink back into it)
  const [viewer, setViewer] = useState<{ open: boolean; index: number; el: HTMLElement | null }>({
    open: false,
    index: 0,
    el: null,
  });
  const origin = useMemo(() => ({ el: viewer.el, index: viewer.index }), [viewer.el, viewer.index]);
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
              onClick={(e) =>
                setViewer({ open: true, index: i, el: e.currentTarget.firstElementChild as HTMLElement | null })
              }
              aria-label={`Отворете ја фотографијата ${i + 1} од ${count}: ${photo.alt}`}
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

      <PhotoLightbox
        photos={photos}
        open={viewer.open}
        startIndex={viewer.index}
        origin={origin}
        label="Фотографии од проектот"
        onClose={() => setViewer((v) => ({ ...v, open: false }))}
      />
    </section>
  );
}
