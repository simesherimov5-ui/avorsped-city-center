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
  render3d,
}: {
  plan: Plan;
  apartmentNumber: string;
  ratio: number;
  /** The apartment's 3D render (data/renders.ts): with it the viewer gets ОСНОВА / 3D tabs, even while the file is missing. */
  render3d?: { src: string; available: boolean };
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

  const tabs = render3d
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

  return (
    <div className="apt-plan relative rounded-xl bg-sand text-onyx">
      {tabs ? (
        // ОСНОВА / 3D: real tabs, the chosen one underlined in Бронза (the gold of a light surface), the other muted
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
          {render3d && (
            <div
              role="tabpanel"
              id={`${uid}-panel-3d`}
              aria-labelledby={`${uid}-tab-3d`}
              hidden={onPlan}
              className="h-full w-full"
            >
              {/* mounted only once the tab has been opened, and fetched at once then (priority: no waiting for a lazy-load
                  observer); whole, centred, never cropped or stretched */}
              {seen3d &&
                (render3d.available && !failed ? (
                  <Media
                    image={{ src: render3d.src, alt: `3D приказ — Стан ${apartmentNumber}`, isPlaceholder: false }}
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

      {canEnlarge && (
        // kept in place (only hidden) on the 3D tab, so the card keeps its height when switching
        <div
          className={`flex justify-end border-t border-onyx/10 px-4 py-3 sm:px-8${onPlan ? "" : " invisible"}`}
          aria-hidden={onPlan ? undefined : true}
        >
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
