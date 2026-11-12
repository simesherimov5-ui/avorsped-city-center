"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent, type RefObject } from "react";
// the close button (.bk-modal-close) and the black theme's variables, which only the About and Contact pages load
import "@/components/black/black.css";
import { Media } from "@/components/ui/Media";
import { Modal, type ModalChoreography } from "@/components/ui/Modal";
import { CALM_EASE, INOUT_EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import { IMAGE_DIMS } from "@/lib/image-dims";
import { aspectOf } from "@/lib/image-sizes";
import { captionOf, clampIndex, dragOffset, dragOutcome, growTransform, mostlyOnScreen } from "@/lib/lightbox";

export type LightboxPhoto = {
  src: string;
  alt: string;
  isPlaceholder: boolean;
  /** A line drawing (a floor plan): served as it is, never resized or re-encoded (with surface "light"). */
  crisp?: boolean;
};
/** The image the pop-up opens from (a card, a thumbnail, a plan) and the photo it shows; none for a button. */
export type LightboxOrigin = { el: HTMLElement | null; index: number };

/** The photo frame's proportions (the photos' own, 1538:1022). */
export const LIGHTBOX_ASPECT = 1538 / 1022;
const GAP = 56;
const pad = (n: number) => String(n).padStart(2, "0");
const COPPER = "var(--color-copper)";
const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-copper)]";
const ARROW = `flex size-11 shrink-0 items-center justify-center rounded-full border text-paper transition-colors duration-200 motion-reduce:transition-none ${FOCUS}`;
const ICON = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5 };

type Control = { finishEnter: () => void };

const el = <T extends HTMLElement>(root: ParentNode, selector: string) => root.querySelector<T>(selector);
const all = (root: ParentNode, selector: string) => [...root.querySelectorAll<HTMLElement>(selector)];
/** The image a pop-up grows from is hidden while the frame is on its way, and shown again when the frame lands. */
const setSourceVisible = (node: HTMLElement, visible: boolean) => {
  node.style.visibility = visible ? "" : "hidden";
};
/**
 * The slow opening's unveil (slowOpen): the frame is cut off by a clip that shows it from the bottom up when it opens and
 * hides it from the top down when it closes. The shown clip is a little larger than the frame (in %, like the others, so
 * the tween stays in one unit) so the mat line, 12px outside the frame, is not cut; it is removed when the opening ends.
 */
const CLIP_HIDDEN = "inset(100% 0% 0% 0%)";
const CLIP_SHOWN = "inset(-5% -3% -5% -3%)";
const CLIP_GONE = "inset(0% 0% 100% 0%)";
const finish = (tl: gsap.core.Animation | null | undefined) => {
  if (!tl) return;
  tl.progress(1).kill();
};

/**
 * The photo pop-up of the gallery, direction «Галерија»: the site's Modal (dark Оникс 98% backdrop, scroll lock, focus
 * trap and focus return, Esc, ✕) with the motion below, which is its own (`choreography`, see Modal.tsx).
 *
 * Opening from an image that is on screen, the photo frame grows from that image's exact place (one uniform scale and a
 * move, so the building is never stretched), 1050ms; from a button it fades and scales in, 600ms. Then the controls come in from
 * 14px below one after another. The photos lie on one strip, 56px apart, and a change slides it (950ms; the current photo
 * whole, the rest at 25%). Dragging moves the strip with the finger (touch-action: pan-y); it changes the photo after 18% of the
 * width or a flick, and at the first and last photo follows only 30%. The counter rolls through a mask, the caption
 * (the alt text without the project prefix) and the thumbnails' copper rail move with the same curve. Closing: the controls
 * fade, then the frame shrinks back into the image it came from (if that is still the photo shown and on screen), or fades.
 * A new click, key or drag finishes the running motion at once. With reduced motion every step is a 200ms fade. One photo
 * (a plan): no strip, counter, caption, thumbnails or arrows, only the opening, closing and the mat line.
 */
export function PhotoLightbox({
  photos,
  open,
  startIndex = 0,
  origin,
  label,
  onClose,
  aspect,
  surface = "dark",
  slowOpen = false,
}: {
  photos: LightboxPhoto[];
  open: boolean;
  /** The photo it opens on (read each time it opens). */
  startIndex?: number;
  origin?: LightboxOrigin | null;
  /** The pop-up's accessible name and the small label top left. */
  label: string;
  onClose: () => void;
  /** The photo frame's proportions; by default those of the photo it opens on (between 1.2 and 2), so the mat hugs the photo. */
  aspect?: number;
  /** "light": the frame is a light surface (Травертин) for line drawings of dark lines on a transparent ground, a plan. */
  surface?: "dark" | "light";
  /**
   * The opening for a pop-up that is opened from a button (not from an image it grows out of): the frame rises 60px while
   * it is unveiled from the bottom up (1.1s), after the 0.9s backdrop, and the controls come in later, as it settles; it
   * closes by dropping 40px while it is hidden from the top down (0.7s). The grow out of an image, the navigation and the
   * reduced-motion fade are unchanged.
   */
  slowOpen?: boolean;
}) {
  const indexRef = useRef(startIndex);
  const control = useRef<Control>({ finishEnter: () => {} });
  const running = useRef<{ enter: gsap.core.Timeline | null; exit: gsap.core.Timeline | null }>({
    enter: null,
    exit: null,
  });
  const hidden = useRef<HTMLElement | null>(null);

  const choreography = useMemo<ModalChoreography>(() => {
    const restore = () => {
      if (hidden.current) setSourceVisible(hidden.current, true);
      hidden.current = null;
    };
    const hide = () => {
      const source = origin?.el;
      if (!source) return;
      setSourceVisible(source, false);
      hidden.current = source;
    };
    return {
      enter: ({ dialog, backdrop }) => {
        finish(running.current.exit);
        running.current.exit = null;
        running.current.enter?.kill();
        restore();
        const reduce = prefersReducedMotion();
        const frame = el<HTMLElement>(dialog, "[data-lb-frame]");
        const mat = el<HTMLElement>(dialog, "[data-lb-mat]");
        const close = el<HTMLElement>(dialog, 'button[aria-label="Затворете"]');
        const items = all(dialog, "[data-lb-in]");
        const neighbours = all(dialog, "[data-lb-slide]").filter((s) => s.dataset.current !== "true");
        if (!frame) return;
        gsap.set(frame, { clearProps: "transform,opacity,clipPath" });
        const tl = gsap.timeline({ onComplete: restore });
        running.current.enter = tl;
        control.current.finishEnter = () => {
          if (running.current.enter) finish(running.current.enter);
          running.current.enter = null;
        };
        const target = (node: HTMLElement) =>
          node.dataset.lbIn === "thumb" && node.dataset.active !== "true" ? 0.4 : 1;

        if (reduce) {
          tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "none" }, 0);
          tl.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "none" }, 0);
          tl.fromTo(
            [...items, ...(close ? [close] : [])],
            { opacity: 0 },
            { opacity: (_i, node: HTMLElement) => target(node), duration: 0.2, ease: "none" },
            0
          );
          return;
        }

        const box = origin?.el && origin.index === indexRef.current ? origin.el.getBoundingClientRect() : null;
        const from =
          box && mostlyOnScreen(box, window.innerWidth, window.innerHeight)
            ? { left: box.left, top: box.top, width: box.width, height: box.height }
            : null;
        // the slower opening is only for the button's fade-and-scale, never for the grow out of an image
        const slow = slowOpen && !from;
        tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: slow ? 0.9 : 0.7, ease: CALM_EASE }, 0);
        if (slow) {
          // rises from 60px below while it is unveiled from the bottom up (no scale), 0.15s after the backdrop begins
          tl.fromTo(
            frame,
            { y: 60, clipPath: CLIP_HIDDEN },
            { y: 0, clipPath: CLIP_SHOWN, duration: 1.1, ease: INOUT_EASE },
            0.15
          );
          tl.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: CALM_EASE }, 0.15);
          // the clip and the move are taken off when it has landed (also when a key or a click finishes the opening at once)
          tl.call(() => void gsap.set(frame, { clearProps: "transform,clipPath" }), [], 1.25);
          if (mat) tl.fromTo(mat, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: CALM_EASE }, 1.05);
        } else if (from) {
          const m = growTransform(from, frame.getBoundingClientRect());
          hide();
          tl.fromTo(
            frame,
            { x: m.x, y: m.y, scale: m.scale, transformOrigin: "50% 50%" },
            { x: 0, y: 0, scale: 1, duration: 1.05, ease: INOUT_EASE, onComplete: restore },
            0
          );
          if (mat) tl.fromTo(mat, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: CALM_EASE }, 0.5);
        } else {
          tl.fromTo(
            frame,
            { opacity: 0, scale: 0.97, transformOrigin: "50% 50%" },
            { opacity: 1, scale: 1, duration: 0.6, ease: CALM_EASE },
            0
          );
        }
        // the neighbours of the photo shown come in as the frame settles
        if (neighbours.length) {
          gsap.set(neighbours, { opacity: 0 });
          tl.to(neighbours, { opacity: 0.25, duration: 0.6, ease: CALM_EASE }, from ? 0.7 : slow ? 1.2 : 0.35);
        }
        const rise = (nodes: HTMLElement[], at: number, to?: (n: HTMLElement) => number) =>
          nodes.forEach((n, i) =>
            tl.fromTo(
              n,
              { y: 14, opacity: 0 },
              { y: 0, opacity: to ? to(n) : 1, duration: slow ? 0.9 : 0.8, ease: CALM_EASE },
              at + i * 0.09
            )
          );
        rise(
          close ? [close, ...all(dialog, '[data-lb-in="top"]')] : all(dialog, '[data-lb-in="top"]'),
          slow ? 0.75 : 0.7
        );
        rise(all(dialog, '[data-lb-in="counter"]'), slow ? 0.8 : 0.76);
        rise(all(dialog, '[data-lb-in="caption"]'), slow ? 0.9 : 0.85);
        rise(all(dialog, '[data-lb-in="arrow"]'), slow ? 1 : 0.94);
        all(dialog, '[data-lb-in="thumb"]').forEach((n, i) =>
          tl.fromTo(
            n,
            { y: 14, opacity: 0 },
            { y: 0, opacity: target(n), duration: slow ? 0.9 : 0.8, ease: CALM_EASE },
            (slow ? 0.95 : 0.9) + i * 0.055
          )
        );
        all(dialog, '[data-lb-in="rail"]').forEach((n) =>
          tl.fromTo(n, { opacity: 0 }, { opacity: 1, duration: slow ? 0.9 : 0.8, ease: CALM_EASE }, slow ? 1.3 : 1.15)
        );
      },

      exit: ({ dialog, backdrop }, done) => {
        finish(running.current.enter);
        running.current.enter = null;
        running.current.exit?.kill();
        const reduce = prefersReducedMotion();
        const frame = el<HTMLElement>(dialog, "[data-lb-frame]");
        const close = el<HTMLElement>(dialog, 'button[aria-label="Затворете"]');
        const items = [...all(dialog, "[data-lb-in]"), ...(close ? [close] : [])];
        const side = all(dialog, "[data-lb-slide]").filter((s) => s.dataset.current !== "true");
        const tl = gsap.timeline({
          onComplete: () => {
            restore();
            done();
          },
        });
        running.current.exit = tl;
        if (!frame) {
          tl.to(backdrop, { opacity: 0, duration: 0.2 }, 0);
          return;
        }
        if (reduce) {
          tl.to([frame, backdrop, ...items], { opacity: 0, duration: 0.2, ease: "none" }, 0);
          return;
        }
        tl.to([...items, ...side], { opacity: 0, duration: 0.25, ease: "none" }, 0);
        const box = origin?.el?.isConnected ? origin.el.getBoundingClientRect() : null;
        const back =
          box && origin?.index === indexRef.current && mostlyOnScreen(box, window.innerWidth, window.innerHeight)
            ? { left: box.left, top: box.top, width: box.width, height: box.height }
            : null;
        if (back) {
          const m = growTransform(back, frame.getBoundingClientRect());
          hide();
          const mat = el<HTMLElement>(dialog, "[data-lb-mat]");
          if (mat) tl.to(mat, { opacity: 0, duration: 0.25, ease: "none" }, 0);
          tl.to(
            frame,
            { x: m.x, y: m.y, scale: m.scale, duration: 0.85, ease: INOUT_EASE, transformOrigin: "50% 50%" },
            0.1
          );
          tl.to(backdrop, { opacity: 0, duration: 0.5, ease: CALM_EASE }, 0.42);
        } else if (slowOpen) {
          // the slow opening's closing: the controls fade (above), the frame drops 40px while it is hidden from the top down
          const mat = el<HTMLElement>(dialog, "[data-lb-mat]");
          if (mat) tl.to(mat, { opacity: 0, duration: 0.25, ease: "none" }, 0);
          tl.fromTo(
            frame,
            { y: 0, clipPath: CLIP_SHOWN },
            { y: 40, clipPath: CLIP_GONE, duration: 0.7, ease: INOUT_EASE },
            0.15
          );
          tl.to(backdrop, { opacity: 0, duration: 0.45, ease: CALM_EASE }, 0.35);
        } else {
          tl.to(frame, { opacity: 0, scale: 0.97, duration: 0.5, ease: CALM_EASE, transformOrigin: "50% 50%" }, 0);
          tl.to(backdrop, { opacity: 0, duration: 0.45, ease: CALM_EASE }, 0.3);
        }
      },
    };
    // `origin` is a new object for every opening
  }, [origin, slowOpen]);

  // a pop-up that is taken off the page mid-motion gives the image back
  useEffect(() => {
    const live = running.current;
    return () => {
      live.enter?.kill();
      live.exit?.kill();
      if (hidden.current) setSourceVisible(hidden.current, true);
    };
  }, []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      label={label}
      overlay={0.98}
      closeIn="screen"
      className="w-full"
      choreography={choreography}
    >
      <LightboxBody
        photos={photos}
        startIndex={startIndex}
        label={label}
        aspect={aspect}
        surface={surface}
        indexRef={indexRef}
        control={control}
      />
    </Modal>
  );
}

function LightboxBody({
  photos,
  startIndex,
  label,
  aspect,
  surface,
  indexRef,
  control,
}: {
  photos: LightboxPhoto[];
  startIndex: number;
  label: string;
  aspect?: number;
  surface: "dark" | "light";
  indexRef: RefObject<number>;
  control: RefObject<Control>;
}) {
  const count = photos.length;
  const many = count > 1;
  const start = clampIndex(startIndex, count);
  const [index, setIndex] = useState(start);
  const frameAspect = aspect ?? Math.min(2, Math.max(1.2, aspectOf(photos[start]?.src ?? "") ?? LIGHTBOX_ASPECT));
  const current = useRef(start);
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const thumbsBox = useRef<HTMLDivElement>(null);
  const change = useRef<gsap.core.Timeline | null>(null);
  const drag = useRef<{ x: number; t: number; id: number } | null>(null);
  // the two layers of the rolling counter and of the caption: the one in front and the one behind
  const front = useRef({ counter: 0, caption: 0 });

  const width = () => frame.current?.offsetWidth ?? 0;
  const baseX = (i: number) => -i * (width() + GAP);
  const layers = (kind: "counter" | "caption") => all(root.current!, `[data-lb-layer="${kind}"]`);
  const thumbs = () => all(root.current!, "[data-lb-thumb]");
  const slides = () => all(root.current!, "[data-lb-slide]");

  // the resting state of a photo: where the strip, the layers, the thumbnails and the rail stand
  const place = (i: number) => {
    if (!root.current) return;
    gsap.set(strip.current, { x: baseX(i) });
    slides().forEach((s, k) => {
      s.dataset.current = String(k === i);
      gsap.set(s, { opacity: k === i ? 1 : 0.25 });
    });
    thumbs().forEach((t, k) => {
      t.dataset.active = String(k === i);
      gsap.set(t, { opacity: k === i ? 1 : 0.4 });
    });
    const t = thumbs()[i];
    if (t && rail.current) gsap.set(rail.current, { x: t.offsetLeft, width: t.offsetWidth });
    const [c0, c1] = layers("counter");
    const [p0, p1] = layers("caption");
    front.current = { counter: 0, caption: 0 };
    if (c0) {
      c0.textContent = pad(i + 1);
      gsap.set(c0, { yPercent: 0, opacity: 1 });
    }
    if (c1) gsap.set(c1, { yPercent: 100, opacity: 1 });
    if (p0) {
      p0.textContent = captionOf(photos[i]?.alt);
      gsap.set(p0, { y: 0, opacity: 1 });
    }
    if (p1) gsap.set(p1, { y: 10, opacity: 0 });
  };

  useLayoutEffect(() => {
    indexRef.current = start;
    place(start);
    // the resting state is placed once per opening; the choreography of the Modal starts after this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (!drag.current && !change.current?.isActive()) gsap.set(strip.current, { x: baseX(current.current) });
    };
    window.addEventListener("resize", onResize);
    const live = change;
    return () => {
      window.removeEventListener("resize", onResize);
      live.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (target: number) => {
    if (!many) return;
    control.current?.finishEnter();
    finish(change.current);
    change.current = null;
    const next = clampIndex(target, count);
    const from = current.current;
    const reduce = prefersReducedMotion();
    if (next === from) {
      // a drag that did not change the photo: the strip returns
      if (reduce) gsap.set(strip.current, { x: baseX(next) });
      else gsap.to(strip.current, { x: baseX(next), duration: 0.7, ease: CALM_EASE, overwrite: true });
      return;
    }
    current.current = next;
    indexRef.current = next;
    setIndex(next);

    const tl = gsap.timeline({ onComplete: () => void (change.current = null) });
    change.current = tl;
    const T = reduce ? 0.2 : 0.95;
    const ease = reduce ? "none" : INOUT_EASE;

    slides().forEach((s, k) => {
      s.dataset.current = String(k === next);
    });
    thumbs().forEach((t, k) => {
      t.dataset.active = String(k === next);
    });

    // the strip and the photos' brightness
    if (reduce) {
      gsap.set(strip.current, { x: baseX(next) });
      const incoming = slides()[next];
      slides().forEach((s, k) => gsap.set(s, { opacity: k === next ? 1 : 0.25 }));
      if (incoming) tl.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: T, ease }, 0);
    } else {
      tl.to(strip.current, { x: baseX(next), duration: T, ease, overwrite: true }, 0);
      slides().forEach((s, k) => tl.to(s, { opacity: k === next ? 1 : 0.25, duration: T, ease }, 0));
    }
    thumbs().forEach((t, k) => tl.to(t, { opacity: k === next ? 1 : 0.4, duration: T, ease }, 0));

    // the rail under the thumbnails
    const active = thumbs()[next];
    if (active && rail.current) {
      if (reduce) gsap.set(rail.current, { x: active.offsetLeft, width: active.offsetWidth });
      else tl.to(rail.current, { x: active.offsetLeft, width: active.offsetWidth, duration: T, ease }, 0);
      const box = thumbsBox.current;
      if (box && box.scrollWidth > box.clientWidth) {
        box.scrollTo({
          left: active.offsetLeft - (box.clientWidth - active.offsetWidth) / 2,
          behavior: reduce ? "auto" : "smooth",
        });
      }
    }

    // the counter rolls: the old number out upwards, the new one in from below 120ms later
    const [c0, c1] = layers("counter");
    if (c0 && c1) {
      const out = front.current.counter === 0 ? c0 : c1;
      const incoming = out === c0 ? c1 : c0;
      front.current.counter = out === c0 ? 1 : 0;
      incoming.textContent = pad(next + 1);
      if (reduce) {
        gsap.set(out, { yPercent: 100 });
        gsap.set(incoming, { yPercent: 0 });
        tl.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: T, ease }, 0);
      } else {
        gsap.set(incoming, { yPercent: 100, opacity: 1 });
        tl.to(out, { yPercent: -100, duration: 0.75, ease: INOUT_EASE }, 0);
        tl.to(incoming, { yPercent: 0, duration: 0.85, ease: INOUT_EASE }, 0.12);
      }
    }

    // the caption: the old one fades out and up, the new one in from below 250ms later
    const [p0, p1] = layers("caption");
    if (p0 && p1) {
      const out = front.current.caption === 0 ? p0 : p1;
      const incoming = out === p0 ? p1 : p0;
      front.current.caption = out === p0 ? 1 : 0;
      incoming.textContent = captionOf(photos[next]?.alt);
      if (reduce) {
        gsap.set(out, { opacity: 0, y: 0 });
        tl.fromTo(incoming, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: T, ease }, 0);
      } else {
        gsap.set(incoming, { y: 10, opacity: 0 });
        tl.to(out, { opacity: 0, y: -8, duration: 0.45, ease: CALM_EASE }, 0);
        tl.to(incoming, { opacity: 1, y: 0, duration: 0.8, ease: CALM_EASE }, 0.25);
      }
    }
  };

  // the keys: ← → Home End, whatever has focus inside the pop-up (Esc and Tab are the Modal's)
  const goRef = useRef(goTo);
  useEffect(() => {
    goRef.current = goTo;
  });
  useEffect(() => {
    if (!many) return;
    const onKey = (e: KeyboardEvent) => {
      const i = current.current;
      if (e.key === "ArrowRight") goRef.current(i + 1);
      else if (e.key === "ArrowLeft") goRef.current(i - 1);
      else if (e.key === "Home") goRef.current(0);
      else if (e.key === "End") goRef.current(count - 1);
      else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [many, count]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!many || (e.pointerType === "mouse" && e.button !== 0)) return;
    control.current?.finishEnter();
    finish(change.current);
    change.current = null;
    gsap.killTweensOf(strip.current);
    drag.current = { x: e.clientX, t: e.timeStamp, id: e.pointerId };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    gsap.set(strip.current, { x: baseX(current.current) + dragOffset(e.clientX - d.x, current.current, count) });
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const dx = e.clientX - d.x;
    const step = cancelled ? 0 : dragOutcome(dx, e.timeStamp - d.t, width(), current.current, count);
    goTo(current.current + step);
  };

  const roll = "text-[30px] min-[720px]:text-[38px]";
  const stageWidth = `min(calc(100vw - 48px), 1400px, calc((100svh - ${many ? 220 : 120}px) * ${frameAspect.toFixed(4)}))`;

  return (
    <div ref={root}>
      <div
        data-lb-in="top"
        className="pointer-events-none fixed left-6 top-6 z-10 max-w-[calc(100vw-120px)] truncate text-label font-semibold uppercase tracking-label text-paper/70 min-[720px]:left-8 min-[720px]:top-7"
      >
        {label}
      </div>

      {/* the strip's window is the whole screen's width: the photos beside the current one show at 25% */}
      <div style={{ width: "100vw", marginInline: "calc(50% - 50vw)", overflowX: "clip" }}>
        <div
          ref={frame}
          data-lb-frame
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, false)}
          onPointerCancel={(e) => endDrag(e, true)}
          onDragStart={(e) => e.preventDefault()}
          className={`relative mx-auto touch-pan-y select-none [&_img]:[-webkit-user-drag:none] ${surface === "light" ? "bg-sand" : ""}`}
          style={{ width: stageWidth, aspectRatio: frameAspect }}
        >
          <div ref={strip} className="absolute inset-0 flex will-change-transform" style={{ gap: GAP }}>
            {photos.map((photo, i) => (
              <div
                key={photo.src}
                data-lb-slide
                aria-hidden={i !== index}
                className={`relative h-full flex-none basis-full ${surface === "light" ? "p-3 min-[720px]:p-5" : ""}`}
              >
                {surface === "light" && photo.crisp ? (
                  // a plan: the drawing as it is, whole, on the light frame
                  <Media
                    image={photo}
                    fit="contain"
                    crisp
                    sizes="(min-width: 1440px) 1400px, 100vw"
                    priority={i === start}
                    className="h-full w-full !bg-transparent"
                  />
                ) : (
                  <Media
                    image={photo}
                    whole
                    maxWidth={IMAGE_DIMS[photo.src]?.[0]}
                    quality={85}
                    sizes="(min-width: 1440px) 1400px, 100vw"
                    priority={i === start}
                    defer={i !== start}
                    className="h-full w-full"
                  />
                )}
              </div>
            ))}
          </div>
          {/* the mat: a 1px line in Светол бакар at 22%, 12px outside the frame (8px on a phone) */}
          <div
            data-lb-mat
            aria-hidden
            className="pointer-events-none absolute -inset-2 border min-[720px]:-inset-3"
            style={{ borderColor: `color-mix(in srgb, ${COPPER} 22%, transparent)` }}
          />
        </div>
      </div>

      {many && (
        <div className="mx-auto mt-8 min-[720px]:mt-9" style={{ width: stageWidth }}>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div data-lb-in="counter" className="flex items-baseline gap-3 text-paper">
              <span
                aria-hidden
                className={`font-display relative inline-block overflow-hidden align-bottom leading-[1.2] ${roll}`}
                style={{ color: COPPER, height: "1.2em" }}
              >
                <span className="invisible">00</span>
                <span data-lb-layer="counter" className="absolute inset-0 block text-left" />
                <span data-lb-layer="counter" className="absolute inset-0 block text-left" />
              </span>
              <span aria-hidden className="text-label font-semibold tracking-label text-paper/70 tabular-nums">
                / {pad(count)}
              </span>
              <span aria-live="polite" className="sr-only">
                {`Фотографија ${index + 1} од ${count}`}
              </span>
            </div>

            <div
              data-lb-in="caption"
              aria-hidden
              className="font-display relative order-last h-[1.5em] min-w-0 basis-full text-[clamp(18px,1.7vw,23px)] italic leading-[1.5] text-paper min-[720px]:order-none min-[720px]:basis-0 min-[720px]:flex-1"
            >
              <span data-lb-layer="caption" className="absolute inset-x-0 block truncate" />
              <span data-lb-layer="caption" className="absolute inset-x-0 block truncate" />
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                data-lb-in="arrow"
                aria-label="Претходна фотографија"
                aria-disabled={index === 0}
                onClick={() => goTo(current.current - 1)}
                className={ARROW}
                style={{
                  borderColor: `color-mix(in srgb, ${COPPER} 55%, transparent)`,
                  opacity: index === 0 ? 0.4 : 1,
                }}
              >
                <svg {...ICON} aria-hidden>
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                data-lb-in="arrow"
                aria-label="Следна фотографија"
                aria-disabled={index === count - 1}
                onClick={() => goTo(current.current + 1)}
                className={ARROW}
                style={{
                  borderColor: `color-mix(in srgb, ${COPPER} 55%, transparent)`,
                  opacity: index === count - 1 ? 0.4 : 1,
                }}
              >
                <svg {...ICON} aria-hidden>
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={thumbsBox} className="mt-4 overflow-x-auto pb-2 [scrollbar-width:none]">
            <div className="relative flex w-max gap-2 pb-2">
              {photos.map((photo, i) => (
                <button
                  key={photo.src}
                  type="button"
                  data-lb-in="thumb"
                  data-lb-thumb
                  aria-label={`Фотографија ${i + 1} од ${count}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className={`relative h-12 w-[72px] shrink-0 overflow-hidden ${FOCUS}`}
                >
                  <Media image={photo} sizes="72px" defer className="h-full w-full" />
                </button>
              ))}
              {/* the 1px Светол бакар rail under the active thumbnail */}
              <div data-lb-in="rail" aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-px">
                <div ref={rail} className="h-px" style={{ backgroundColor: COPPER }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
