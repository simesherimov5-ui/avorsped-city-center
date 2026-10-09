"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { X } from "lucide-react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { BuildingMark } from "@/components/ui/Logo";
import { useCompare } from "@/lib/compare-context";
import { getLenis } from "@/lib/lenis";
import { formatArea, statusLabel } from "@/lib/format";
import { roomLabel, type FinderApartment, type FinderBuilding } from "@/lib/apartment-finder";
import { Tower } from "./Tower";

const FOCUSABLE = 'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"])';
const STATUS_CLASS = { available: "free", reserved: "res", sold: "sold" } as const;
const CLOSE_MS = 420;

/**
 * One apartment in a pop-up over the page. It opens like the site's curtain: the page behind darkens, a thin line is
 * drawn across the middle, the panel opens up and down from it and the content rises in. Stepping to the next
 * apartment replaces the content at once (no curtain again). It closes to the line. The page does not navigate: the
 * parent keeps the open apartment in the address.
 */
export function ApartmentPopup({
  open,
  instant,
  apartment,
  walk,
  buildings,
  apartments,
  onStep,
  onClose,
}: {
  /** The id of the apartment that is open, or null. */
  open: string | null;
  /** Opened from an address: it is simply there, nothing plays. */
  instant: boolean;
  apartment: FinderApartment | null;
  /** The apartments the arrows walk through: the current list, in its order. */
  walk: FinderApartment[];
  buildings: FinderBuilding[];
  apartments: Map<string, FinderApartment>;
  onStep: (id: string) => void;
  onClose: () => void;
}) {
  // It stays on screen through the closing animation: `open` starts it, `shown` ends it.
  const [shown, setShown] = useState<FinderApartment | null>(open ? apartment : null);
  const [phase, setPhase] = useState<"in" | "out" | "enter">(instant ? "in" : "enter");
  const [wasOpen, setWasOpen] = useState(open !== null);
  // true once the visitor has stepped to another apartment: its content then starts to rise at once
  const [quick, setQuick] = useState(false);
  if ((open !== null) !== wasOpen) {
    setWasOpen(open !== null);
    if (open !== null) {
      setShown(apartment);
      setQuick(false);
      setPhase(instant ? "in" : "enter");
    } else {
      setPhase("out");
    }
  } else if (open !== null && apartment && shown?.id !== apartment.id) {
    setShown(apartment);
  }

  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const onStepRef = useRef(onStep);
  useEffect(() => {
    onCloseRef.current = onClose;
    onStepRef.current = onStep;
  });

  const focusKey = useRef<string | null>(null);
  const shownId = shown?.id;
  useEffect(() => {
    // the control that had focus is gone with the old content: the same one gets it back, or else the ×
    const key = focusKey.current ?? (document.activeElement === document.body ? "close" : null);
    if (!key) return;
    const target = dialog.current?.querySelector<HTMLElement>(`[data-fk="${key}"]`);
    focusKey.current = null;
    target?.focus({ preventScroll: true });
  }, [shownId]);

  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // the curtain: mounted closed, then opened on the next frames
  useEffect(() => {
    if (phase !== "enter" || !shown) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setPhase("in"));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [phase, shown]);

  // closing: the panel goes back to the line, then it is removed and focus returns to what opened it
  useEffect(() => {
    if (phase !== "out") return;
    const timer = window.setTimeout(
      () => {
        setShown(null);
        returnTo.current?.focus?.({ preventScroll: true });
        returnTo.current = null;
      },
      reduce() ? 0 : CLOSE_MS
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  // while it is on screen: the page behind is locked, focus moves in, the arrow keys step
  const isShown = shown !== null;
  useEffect(() => {
    if (!isShown) return;
    if (
      !returnTo.current &&
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
    ) {
      returnTo.current = document.activeElement;
    }
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    getLenis()?.stop();
    closeButton.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = previous;
      getLenis()?.start();
    };
  }, [isShown]);

  const { ids, toggle, isFull } = useCompare();

  if (!shown) return null;
  const a = shown;
  const building = buildings.find((b) => b.id === a.buildingId);
  const list = walk.some((x) => x.id === a.id) ? walk : [a];
  const index = Math.max(
    0,
    list.findIndex((x) => x.id === a.id)
  );
  const step = (d: number) => {
    if (list.length < 2) return;
    // the content is replaced: focus goes back to the same control afterwards
    const active = document.activeElement;
    focusKey.current = active instanceof HTMLElement ? (active.dataset.fk ?? null) : null;
    setQuick(true);
    onStepRef.current(list[(index + d + list.length) % list.length].id);
  };

  const floor = building?.floors.find((f) => f.number === a.floor);
  const place = floor ? floor.apartmentIds.indexOf(a.id) + 1 : 0;
  const project = building?.project ?? "";
  const buildingName = building?.name ?? "";
  const inCompare = ids.includes(a.id);
  const compareBlocked = isFull && !inCompare;

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
      return;
    }
    if (e.key !== "Tab") return;
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null
    );
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === e.currentTarget)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // the content starts to rise as the panel has opened; stepping to another apartment starts at once
  const timing = { "--t": quick ? "0.05s" : undefined } as CSSProperties;

  return (
    <div
      ref={dialog}
      className={`af-modal ${phase === "in" ? "is-in" : phase === "out" ? "is-out" : ""}${instant ? " is-instant" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="af-popup-name"
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <button type="button" className="af-scrim" aria-label="Затвори" tabIndex={-1} onClick={onClose} />
      <i className="af-hair" aria-hidden />
      <div className="af-sheet" style={timing}>
        <Content
          key={a.id}
          a={a}
          building={building}
          buildingName={buildingName}
          project={project}
          place={place}
          perFloor={floor?.apartmentIds.length ?? 0}
          index={index}
          total={list.length}
          apartments={apartments}
          inCompare={inCompare}
          compareBlocked={compareBlocked}
          closeButton={closeButton}
          onClose={onClose}
          onStep={step}
          onCompare={() => {
            if (!compareBlocked) toggle(a.id);
          }}
        />
      </div>
    </div>
  );
}

function Content({
  a,
  building,
  buildingName,
  project,
  place,
  perFloor,
  index,
  total,
  apartments,
  inCompare,
  compareBlocked,
  closeButton,
  onClose,
  onStep,
  onCompare,
}: {
  a: FinderApartment;
  building: FinderBuilding | undefined;
  buildingName: string;
  project: string;
  place: number;
  perFloor: number;
  index: number;
  total: number;
  apartments: Map<string, FinderApartment>;
  inCompare: boolean;
  compareBlocked: boolean;
  closeButton: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onStep: (d: number) => void;
  onCompare: () => void;
}) {
  const mark = STATUS_CLASS[a.status];
  return (
    <>
      <button ref={closeButton} type="button" className="af-x" data-fk="close" aria-label="Затвори" onClick={onClose}>
        <X className="h-[14px] w-[14px]" strokeWidth={1.4} aria-hidden />
      </button>

      <div className="af-stage">
        <div className="af-stage-plan">
          <div className="af-plan-box">
            <div className={`af-plan-img af-draw-in${a.plan.transparent ? " is-sheet" : ""}`}>
              {a.plan.isPlaceholder || !a.plan.src ? (
                <BuildingMark className="af-nophoto" />
              ) : (
                <Media
                  image={a.plan}
                  fit="contain"
                  crisp={a.plan.transparent}
                  className="h-full w-full !bg-transparent"
                  sizes="(max-width: 900px) 100vw, 560px"
                />
              )}
            </div>
          </div>
        </div>
        <div className="af-stage-foot af-rise-in" style={{ "--i": 6 } as CSSProperties}>
          {building && (
            <div className="af-pos">
              <Tower building={building} apartments={apartments} highlight={a.id} />
              <div className="af-pos-t">
                <b>{a.floorLabel}</b>
                {buildingName} · стан {place} од {perFloor} на катот
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="af-info">
        <div className="eyebrow af-rise-in" style={{ "--i": 0 } as CSSProperties}>
          {project}
          {project && project !== buildingName ? ` · ${buildingName}` : ""}
        </div>
        <h2 id="af-popup-name" className="af-rise-in" style={{ "--i": 1 } as CSSProperties}>
          Стан {a.number}
        </h2>
        <div className="af-st af-rise-in" style={{ "--i": 2 } as CSSProperties}>
          <i className={`af-mk ${mark}`} aria-hidden />
          {statusLabel(a.status)}
        </div>
        <dl className="af-facts af-num af-rise-in" style={{ "--i": 3 } as CSSProperties}>
          <div>
            <dt>Површина</dt>
            <dd>{formatArea(a.area, a.areaDecimals)}</dd>
          </div>
          <div>
            <dt>Соби</dt>
            <dd>{roomLabel(a.bedrooms)}</dd>
          </div>
          <div>
            <dt>Кат</dt>
            <dd>{a.floorLabel}</dd>
          </div>
          <div>
            <dt>Зграда</dt>
            <dd>{buildingName}</dd>
          </div>
        </dl>
        <div className="af-acts af-rise-in" style={{ "--i": 4 } as CSSProperties}>
          <Button href={`/contact?apartment=${encodeURIComponent(a.id)}`} variant="primary" tone="dark">
            Закажи консултација
          </Button>
          <div className="af-acts-row">
            <Link href={`/apartments/${a.id}`} className="af-textlink">
              Цела страница на станот <span aria-hidden>→</span>
            </Link>
            <button
              type="button"
              className="af-textlink"
              data-fk="compare"
              aria-disabled={compareBlocked || undefined}
              aria-pressed={inCompare}
              onClick={onCompare}
            >
              {inCompare ? "Во споредба ×" : "+ Спореди"}
            </button>
          </div>
        </div>
        <div className="af-pager af-rise-in" style={{ "--i": 5 } as CSSProperties}>
          <button type="button" aria-label="Претходен стан" data-fk="prev" onClick={() => onStep(-1)}>
            ←
          </button>
          <div className="af-pager-mid af-num">
            <span>
              {index + 1} / {total}
            </span>
            <div className="af-pager-bar">
              <i style={{ width: `${((index + 1) / total) * 100}%` }} />
            </div>
          </div>
          <button type="button" aria-label="Следен стан" data-fk="next" onClick={() => onStep(1)}>
            →
          </button>
        </div>
      </div>
    </>
  );
}
