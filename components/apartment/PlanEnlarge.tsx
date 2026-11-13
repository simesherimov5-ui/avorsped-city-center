"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Maximize2 } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { PhotoLightbox } from "@/components/ui/PhotoLightbox";

type Plan = { src: string; alt: string; isPlaceholder: boolean; transparent?: boolean };
type View = "plan" | "3d";

/**
 * The architect's plan of an apartment, large, on its light surface (the drawings are dark lines on a transparent ground),
 * with an obvious «Зголеми ја основата» action. The plan opens whole in the shared photo pop-up (PhotoLightbox, one-photo
 * mode on a light frame), growing from where it lies on the page. A plan that is not there yet (a placeholder) has nothing
 * to enlarge, so it has no action. `ratio` is the plan's own proportions: the box is as tall as that needs, never
 * cropped, and no taller than the window leaves room for.
 */
export function PlanEnlarge({
  plan,
  apartmentNumber,
  ratio,
  render3dSrc,
}: {
  plan: Plan;
  apartmentNumber: string;
  ratio: number;
  /** The apartment's 3D render, given only when its file exists (lib/render3d.ts): with it the viewer gets ОСНОВА / 3D tabs. */
  render3dSrc?: string;
}) {
  const uid = useId();
  const [view, setView] = useState<View>("plan");
  const [seen3d, setSeen3d] = useState(false);
  const [failed, setFailed] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
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
  // the 3D render in the same pop-up, framed in its own proportions (read from the loaded picture)
  const source3d = useRef<HTMLDivElement>(null);
  const [open3d, setOpen3d] = useState(false);
  const [aspect3d, setAspect3d] = useState<number | undefined>(undefined);
  const label3d = `3D приказ — Стан ${apartmentNumber}`;
  const show3d = () => {
    const img = source3d.current?.querySelector("img");
    if (img?.naturalWidth && img.naturalHeight) setAspect3d(img.naturalWidth / img.naturalHeight);
    setFrom(source3d.current);
    setOpen3d(true);
  };

  const tabs = render3dSrc
    ? ([
        { key: "plan", label: "Основа" },
        { key: "3d", label: "3D" },
      ] as const)
    : null;
  const choose = (next: View) => {
    setView(next);
    if (next === "3d") setSeen3d(true);
  };
  // arrow keys (and Home / End) move between the tabs and select the one they land on
  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!tabs) return;
    const at = tabs.findIndex((t) => t.key === view);
    const to =
      event.key === "ArrowRight"
        ? (at + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (at - 1 + tabs.length) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : -1;
    if (to < 0) return;
    event.preventDefault();
    choose(tabs[to].key);
    tabRefs.current[to]?.focus();
  };
  const onPlan = view === "plan";
  // the enlarge button acts on the view that is shown; on 3D only once the render is there (not the "coming soon" line)
  const can3d = Boolean(render3dSrc) && !failed;
  const canAct = onPlan ? canEnlarge : can3d;

  return (
    <div className="apt-plan relative rounded-xl bg-sand text-onyx">
      {tabs ? (
        // ОСНОВА / 3D: real tabs, the chosen one a solid Оникс chip with gold text, the other outlined (apartment.css)
        <div role="tablist" aria-label={`Приказ на стан ${apartmentNumber}`} onKeyDown={onTabKey} className="apt-tabs">
          {tabs.map((t, i) => (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${t.key}`}
              aria-selected={view === t.key}
              aria-controls={`${uid}-panel-${t.key}`}
              tabIndex={view === t.key ? 0 : -1}
              onClick={() => choose(t.key)}
              className="apt-tab eyebrow"
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : (
        <span className="eyebrow absolute left-4 top-4 z-10 rounded-sm bg-onyx/90 px-2.5 py-1 text-gold">Основа</span>
      )}

      <div className="p-4 pt-14 sm:p-8 sm:pt-16">
        {/* one box for both views, in the plan's proportions, so switching never moves anything */}
        <div className="relative" style={{ aspectRatio: ratio, maxHeight: "min(78svh, 820px)", width: "100%" }}>
          {/* never cropped; a line drawing is served as it is, never larger than its own pixels */}
          <div
            ref={source}
            onClick={canEnlarge && onPlan ? show : undefined}
            className={canEnlarge ? "h-full w-full cursor-zoom-in" : "h-full w-full"}
            {...(tabs && {
              role: "tabpanel",
              id: `${uid}-panel-plan`,
              "aria-labelledby": `${uid}-tab-plan`,
              hidden: !onPlan,
            })}
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
          {render3dSrc && (
            <div
              ref={source3d}
              role="tabpanel"
              id={`${uid}-panel-3d`}
              aria-labelledby={`${uid}-tab-3d`}
              hidden={onPlan}
              onClick={can3d ? show3d : undefined}
              className={can3d ? "h-full w-full cursor-zoom-in" : "h-full w-full"}
            >
              {/* mounted only once the tab has been opened, and fetched at once then (priority: no waiting for a lazy-load
                  observer); whole, centred, never cropped or stretched. If it fails to load, a short line says it is coming. */}
              {seen3d &&
                (!failed ? (
                  <Media
                    image={{ src: render3dSrc, alt: `3D приказ — Стан ${apartmentNumber}`, isPlaceholder: false }}
                    fit="contain"
                    crisp
                    className="h-full w-full !bg-transparent"
                    sizes="(max-width: 1024px) 100vw, 760px"
                    priority
                    onError={() => setFailed(true)}
                  />
                ) : (
                  <p className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
                    3D приказот наскоро ќе биде достапен.
                  </p>
                ))}
            </div>
          )}
        </div>
      </div>

      {(canEnlarge || can3d) && (
        // one bar for both views: the button enlarges the view that is shown. When that view has nothing to enlarge (a
        // render that failed to load) the bar keeps its place, only hidden, so the card keeps its height when switching.
        <div
          className={`flex justify-end border-t border-onyx/10 px-4 py-3 sm:px-8${canAct ? "" : " invisible"}`}
          aria-hidden={canAct ? undefined : true}
        >
          <button
            type="button"
            onClick={onPlan ? show : show3d}
            aria-haspopup="dialog"
            className="focus-ring inline-flex min-h-11 items-center gap-2.5 border border-onyx/30 px-4 text-label font-semibold uppercase tracking-label text-onyx transition-colors duration-200 hover:border-onyx hover:bg-onyx hover:text-travertine motion-reduce:transition-none"
          >
            <Maximize2 className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
            {tabs ? (
              // both labels share one grid cell, the other one only hidden, so the button is always the size of the longer
              // one and the card never changes height when switching
              <span className="grid text-left">
                <span
                  className={`col-start-1 row-start-1${onPlan ? "" : " invisible"}`}
                  aria-hidden={!onPlan || undefined}
                >
                  Зголеми ја основата
                </span>
                <span
                  className={`col-start-1 row-start-1${onPlan ? " invisible" : ""}`}
                  aria-hidden={onPlan || undefined}
                >
                  Зголеми го 3D приказот
                </span>
              </span>
            ) : (
              "Зголеми ја основата"
            )}
          </button>
        </div>
      )}

      {can3d && render3dSrc && (
        <PhotoLightbox
          photos={[{ src: render3dSrc, alt: label3d, isPlaceholder: false, crisp: true }]}
          open={open3d}
          origin={origin}
          label={label3d}
          aspect={aspect3d}
          surface="light"
          zoomable
          onClose={() => setOpen3d(false)}
        />
      )}

      {canEnlarge && (
        <PhotoLightbox
          photos={[{ src: plan.src, alt: label, isPlaceholder: false, crisp: plan.transparent }]}
          open={open}
          origin={origin}
          label={label}
          aspect={ratio}
          surface="light"
          zoomable
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
