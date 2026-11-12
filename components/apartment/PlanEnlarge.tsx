"use client";

import { useMemo, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { PhotoLightbox } from "@/components/ui/PhotoLightbox";

type Plan = { src: string; alt: string; isPlaceholder: boolean; transparent?: boolean };

/**
 * The architect's plan of an apartment, large, on its light surface (the drawings are dark lines on a transparent ground),
 * with an obvious «Зголеми ја основата» action. The plan opens whole in the shared photo pop-up (PhotoLightbox, one-photo
 * mode on a light frame), growing from where it lies on the page. A plan that is not there yet (a placeholder) has nothing
 * to enlarge, so it has no action. `ratio` is the plan's own proportions: the box is as tall as that needs, never
 * cropped, and no taller than the window leaves room for.
 */
export function PlanEnlarge({ plan, apartmentNumber, ratio }: { plan: Plan; apartmentNumber: string; ratio: number }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<HTMLElement | null>(null);
  const source = useRef<HTMLDivElement>(null);
  const origin = useMemo(() => ({ el: from, index: 0 }), [from]);
  const canEnlarge = !plan.isPlaceholder && Boolean(plan.src);
  const label = `Архитектонска основа на стан ${apartmentNumber}`;

  const show = () => {
    setFrom(source.current);
    setOpen(true);
  };

  return (
    <div className="apt-plan relative rounded-xl bg-sand text-onyx">
      <span className="eyebrow absolute left-4 top-4 z-10 rounded-sm bg-onyx/90 px-2.5 py-1 text-gold">Основа</span>

      <div className="p-4 pt-14 sm:p-8 sm:pt-16">
        {/* never cropped; a line drawing is served as it is, never larger than its own pixels */}
        <div
          ref={source}
          onClick={canEnlarge ? show : undefined}
          className={canEnlarge ? "cursor-zoom-in" : undefined}
          style={{ aspectRatio: ratio, maxHeight: "min(78svh, 820px)", width: "100%" }}
        >
          <Media
            image={plan}
            label={label}
            fit="contain"
            crisp={plan.transparent}
            className="h-full w-full !bg-transparent"
            sizes="(max-width: 1024px) 100vw, 760px"
            priority
          />
        </div>
      </div>

      {canEnlarge && (
        <div className="flex justify-end border-t border-onyx/10 px-4 py-3 sm:px-8">
          <button
            type="button"
            onClick={show}
            aria-haspopup="dialog"
            className="focus-ring inline-flex min-h-11 items-center gap-2.5 border border-onyx/30 px-4 text-label font-semibold uppercase tracking-label text-onyx transition-colors duration-200 hover:border-onyx hover:bg-onyx hover:text-travertine motion-reduce:transition-none"
          >
            <Maximize2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Зголеми ја основата
          </button>
        </div>
      )}

      {canEnlarge && (
        <PhotoLightbox
          photos={[{ src: plan.src, alt: label, isPlaceholder: false, crisp: plan.transparent }]}
          open={open}
          origin={origin}
          label={label}
          aspect={ratio}
          surface="light"
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
