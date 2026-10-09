"use client";

import "./finder.css";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { BuildingMark } from "@/components/ui/Logo";
import { formatArea, statusLabel } from "@/lib/format";
import {
  AREA_LABELS,
  FLOOR_LABELS,
  areaOptions,
  choicesQuery,
  countLine,
  placeText,
  filterApartments,
  floorOptions,
  parseChoices,
  roomLabel,
  roomOptions,
  type AreaChoice,
  type Choices,
  type FinderApartment,
  type FinderBuilding,
  type FloorChoice,
} from "@/lib/apartment-finder";
import { ApartmentPopup } from "./ApartmentPopup";
import { Street } from "./Street";

const MARK = { available: "free", reserved: "res", sold: "sold" } as const;
const CARDS_AT_FIRST = 8;
const ROWS_AT_FIRST = 12;

const floorText = (floor: number) => (floor === 0 ? "Приземје" : `Кат ${floor}`);

/** The number in the hero. It counts to the new value in 0.9s (from 0 on load); without motion it just changes. */
function Tally({ value }: { value: number }) {
  const [initial] = useState(value);
  const box = useRef<HTMLSpanElement>(null);
  const current = useRef(value);
  const mounted = useRef(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const from = mounted.current ? current.current : 0;
    mounted.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || from === value) {
      current.current = value;
      el.textContent = String(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 900);
      current.current = Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3)));
      el.textContent = String(current.current);
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return (
    <span ref={box} className="af-tally-n af-num" aria-hidden>
      {initial}
    </span>
  );
}

/**
 * The Пронајди стан page: the hero with the street of buildings (the way a building is chosen), the filter bar, the
 * apartments as cards or a list, and the apartment in a pop-up. Every choice (building, rooms, floor, area, only
 * available, the view, the open apartment) is kept in the address and changes without a page load.
 */
export function ApartmentFinder({
  buildings,
  apartments,
  initial,
}: {
  buildings: FinderBuilding[];
  apartments: FinderApartment[];
  initial: { choices: Choices; apartment: string | null };
}) {
  const pathname = usePathname();
  const [choices, setChoices] = useState(initial.choices);
  const [openId, setOpenId] = useState(initial.apartment);
  // an apartment opened from an address is simply there; the curtain plays only for the ones the visitor opens
  const [instant, setInstant] = useState(initial.apartment !== null);
  // the building the visitor has just chosen: only that one plays the rise and the lighting
  const [playing, setPlaying] = useState<string | null>(null);
  const [pages, setPages] = useState(1);
  // the cards rise again after a change of building or filter, not on resize and not when more are added
  const [listKey, setListKey] = useState(0);
  const pushed = useRef(false);
  const bar = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);

  const byId = useMemo(() => new Map(apartments.map((a) => [a.id, a])), [apartments]);
  // where an apartment is, wherever two projects could be confused: "<project> · <building>", or just the project
  const buildingName = (id: string) => {
    const b = buildings.find((x) => x.id === id);
    return b ? placeText(b) : "";
  };
  const buildingIds = useMemo(() => buildings.map((b) => b.id), [buildings]);
  const building = buildings.find((b) => b.id === choices.building);

  const scope = apartments.filter((a) => choices.building === "all" || a.buildingId === choices.building);
  const available = scope.filter((a) => a.status === "available").length;
  const list = filterApartments(apartments, choices);
  const first = choices.view === "list" ? ROWS_AT_FIRST : CARDS_AT_FIRST;
  const shown = list.slice(0, first * pages);
  const left = list.length - shown.length;
  const nextBatch = Math.min(CARDS_AT_FIRST, left);

  const rooms = roomOptions(apartments);
  const floors = floorOptions(apartments);
  const areas = areaOptions(apartments);

  // ---- the address
  const url = (next: Choices, apartment: string | null) => `${pathname}${choicesQuery(next, apartment)}`;

  const choose = (patch: Partial<Choices>) => {
    const next = { ...choices, ...patch };
    setChoices(next);
    setPages(1);
    setListKey((k) => k + 1);
    window.history.replaceState(window.history.state, "", url(next, openId));
  };
  const chooseBuilding = (id: string) => {
    setPlaying(id === "all" ? null : id);
    choose({ building: id });
  };
  const changeView = (view: Choices["view"]) => {
    const next = { ...choices, view };
    setChoices(next);
    setPages(1);
    window.history.replaceState(window.history.state, "", url(next, openId));
  };

  const openApartment = (id: string) => {
    if (openId === null) {
      pushed.current = true;
      window.history.pushState(window.history.state, "", url(choices, id));
    } else {
      window.history.replaceState(window.history.state, "", url(choices, id));
    }
    setInstant(false);
    setOpenId(id);
  };
  const closeApartment = () => {
    if (openId === null) return;
    if (pushed.current) {
      // the address entry the pop-up added is removed again: that is what the Back button does too
      pushed.current = false;
      window.history.back();
    } else {
      window.history.replaceState(window.history.state, "", url(choices, null));
      setOpenId(null);
    }
  };

  // Back and Forward: the address is the truth (it closes the pop-up, or puts a choice back)
  useEffect(() => {
    const onPop = () => {
      const parsed = parseChoices(new URLSearchParams(window.location.search), apartments, buildingIds);
      pushed.current = false;
      setChoices(parsed.choices);
      setOpenId(parsed.apartment);
      setInstant(false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [apartments, buildingIds]);

  // The filter bar sticks right under the navbar, wherever the navbar really is (it slides away and back on scroll).
  useEffect(() => {
    const el = bar.current;
    const header = document.querySelector("header");
    if (!el || !header) return;
    let frame = 0;
    let until = 0;
    const place = () =>
      el.style.setProperty("--af-top", `${Math.max(0, Math.round(header.getBoundingClientRect().bottom))}px`);
    const follow = () => {
      place();
      if (performance.now() < until) frame = requestAnimationFrame(follow);
    };
    const onMove = () => {
      until = performance.now() + 700;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(follow);
    };
    place();
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
    };
  }, []);

  // The line under the room tabs slides to the active tab and takes its width.
  useEffect(() => {
    const box = tabs.current;
    if (!box) return;
    const place = () => {
      const active = box.querySelector<HTMLElement>('.af-tab[aria-pressed="true"]');
      if (!active) return;
      box.style.setProperty("--ink-x", `${active.offsetLeft}px`);
      box.style.setProperty("--ink-w", `${active.offsetWidth}px`);
    };
    place();
    window.addEventListener("resize", place);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    void fonts?.ready.then(place);
    return () => window.removeEventListener("resize", place);
  }, [choices.rooms]);

  // "Прикажи уште": the new ones appear. Focus stays where it was; if the button goes away with the last ones, it
  // moves to the first new one.
  const more = () => {
    const had = shown.length;
    setPages((p) => p + 1);
    if (left <= first) {
      requestAnimationFrame(() =>
        document.querySelectorAll<HTMLElement>(".af-card, .af-row")[had]?.focus({ preventScroll: true })
      );
    }
  };

  const where =
    choices.building === "all" || !building
      ? "во сите згради"
      : `во ${building.name}${building.project !== building.name ? ` · ${building.project}` : ""}`;

  const popupApartment = openId ? (byId.get(openId) ?? null) : null;

  return (
    <div className="af">
      <section className="af-hero af-gut" id="top">
        <div className="af-wrap af-hero-in">
          <div className="af-hero-top">
            <div>
              <div className="eyebrow af-rise" style={{ "--i": 0 } as CSSProperties}>
                <span className="af-sheen">Javor Sped · Пронајди стан</span>
              </div>
              <h1 className="af-h1 af-rise" style={{ "--i": 1 } as CSSProperties}>
                Пронајди го твојот стан
              </h1>
              <p className="af-sub af-rise" style={{ "--i": 2 } as CSSProperties}>
                Избери зграда. Прозорците што ќе засветат се достапни станови.
              </p>
            </div>
            <div className="af-tally af-rise" style={{ "--i": 3 } as CSSProperties}>
              <Tally value={available} />
              <span className="af-tally-t" aria-hidden>
                достапни станови
                <small>{where}</small>
              </span>
              <span className="sr-only-af" aria-live="polite">
                {available} достапни станови {where}
              </span>
            </div>
          </div>

          <Street
            buildings={buildings}
            apartments={byId}
            selected={choices.building}
            playing={playing}
            onSelect={chooseBuilding}
          />

          <div className="af-street-foot">
            <Button
              variant="secondary"
              size="sm"
              tone="dark"
              className="af-all"
              pressed={choices.building === "all"}
              onClick={() => chooseBuilding("all")}
            >
              Сите згради
            </Button>
            <div className="af-legend is-lit" aria-hidden>
              <span>
                <i className="af-win free" />
                {statusLabel("available")}
              </span>
              <span>
                <i className="af-win" />
                {statusLabel("reserved")}
              </span>
              <span>
                <i className="af-win sold" />
                {statusLabel("sold")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="af-light">
        <div ref={bar} className="af-bar af-gut" role="region" aria-label="Филтри">
          <div className="af-wrap af-bar-in">
            <div ref={tabs} className="af-tabs" role="group" aria-label="Број на соби">
              {([["all", "Сите"], ...rooms.map((r) => [r, roomLabel(r)] as const)] as const).map(([value, label]) => (
                <button
                  key={String(value)}
                  type="button"
                  className="af-tab"
                  aria-pressed={choices.rooms === value}
                  onClick={() => choose({ rooms: value })}
                >
                  {label}
                </button>
              ))}
              <i className="af-tab-ink" aria-hidden />
            </div>

            <div className="af-bar-right">
              <label className="af-pick">
                <span>Кат</span>
                <select value={choices.floor} onChange={(e) => choose({ floor: e.target.value as FloorChoice })}>
                  <option value="all">{FLOOR_LABELS.all}</option>
                  {floors.map((f) => (
                    <option key={f} value={f}>
                      {FLOOR_LABELS[f]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="af-pick">
                <span>Површина</span>
                <select value={choices.area} onChange={(e) => choose({ area: e.target.value as AreaChoice })}>
                  <option value="all">{AREA_LABELS.all}</option>
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      {AREA_LABELS[a]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="af-only"
                aria-pressed={choices.free}
                onClick={() => choose({ free: !choices.free })}
              >
                <i aria-hidden />
                Само достапни
              </button>
              <div className="af-views" role="group" aria-label="Приказ">
                <button
                  type="button"
                  className="af-view"
                  aria-label="Картички"
                  aria-pressed={choices.view === "grid"}
                  onClick={() => changeView("grid")}
                >
                  <svg
                    viewBox="0 0 18 18"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden
                  >
                    <path d="M2 2h6v6H2zM10 2h6v6h-6zM2 10h6v6H2zM10 10h6v6h-6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="af-view"
                  aria-label="Листа"
                  aria-pressed={choices.view === "list"}
                  onClick={() => changeView("list")}
                >
                  <svg
                    viewBox="0 0 18 18"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden
                  >
                    <path d="M2 4h14M2 9h14M2 14h14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <section className="af-results af-gut">
          <div className="af-wrap">
            {building?.coming ? (
              <ComingSoon building={building} />
            ) : (
              <div className="af-count af-num" role="status" aria-live="polite">
                {countLine(shown.length, list.length)}
                {building && list.length > 0 ? ` · ${placeText(building)}` : ""}
              </div>
            )}

            {!building?.coming && list.length === 0 && (
              <p className="af-empty">Пробајте со друга зграда, друг број на соби или без „Само достапни“.</p>
            )}

            {list.length > 0 && choices.view === "grid" && (
              <div key={`grid-${listKey}`} className="af-grid">
                {shown.map((a, i) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`af-card${a.status === "sold" ? " is-sold" : ""}`}
                    style={{ "--i": i % (CARDS_AT_FIRST * 2) } as CSSProperties}
                    aria-label={`Стан ${a.number}, ${buildingName(a.buildingId)}, ${roomLabel(a.bedrooms)}, ${statusLabel(a.status)}`}
                    onClick={() => openApartment(a.id)}
                  >
                    <span className="af-ph">
                      <span className="af-ph-img">
                        {a.plan.isPlaceholder || !a.plan.src ? (
                          <BuildingMark className="af-nophoto" />
                        ) : (
                          <Media
                            image={{ ...a.plan, alt: "" }}
                            fit="contain"
                            className="h-full w-full !bg-transparent"
                            sizes="(max-width: 767px) 90vw, 330px"
                          />
                        )}
                      </span>
                      <span className="af-chip">
                        <i className={`af-mk ${MARK[a.status]}`} aria-hidden />
                        {statusLabel(a.status)}
                      </span>
                      <span className="af-where">{buildingName(a.buildingId)}</span>
                    </span>
                    <span className="af-card-t">
                      <b>Стан {a.number}</b>
                      <span aria-hidden>→</span>
                    </span>
                    <span className="af-rule" aria-hidden />
                    <span className="af-card-m af-num">
                      <span>{formatArea(a.area)}</span>
                      <span>{roomLabel(a.bedrooms)}</span>
                      <span>{floorText(a.floor)}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {list.length > 0 && choices.view === "list" && (
              <div key={`list-${listKey}`} className="af-rows">
                {shown.map((a, i) => {
                  const name = buildingName(a.buildingId);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      className="af-row"
                      style={{ "--i": i % 24 } as CSSProperties}
                      onClick={() => openApartment(a.id)}
                    >
                      <b>Стан {a.number}</b>
                      <span className="d">{name}</span>
                      <span className="d af-num">{floorText(a.floor)}</span>
                      <span className="d">{roomLabel(a.bedrooms)}</span>
                      <span className="d af-num">{formatArea(a.area)}</span>
                      <span className="st">
                        <i className={`af-mk ${MARK[a.status]}`} aria-hidden />
                        {statusLabel(a.status)}
                      </span>
                      <span className="go" aria-hidden>
                        →
                      </span>
                      <span className="m af-num">
                        {name} · {floorText(a.floor)} · {roomLabel(a.bedrooms)} · {formatArea(a.area)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {left > 0 && (
              <div className="af-more">
                <Button variant="primary" onClick={more}>
                  Прикажи уште {nextBatch}
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>

      <ApartmentPopup
        open={openId}
        instant={instant}
        apartment={popupApartment}
        walk={list}
        buildings={buildings}
        apartments={byId}
        onStep={openApartment}
        onClose={closeApartment}
      />
    </div>
  );
}

/** A project with no apartments in the data yet: said plainly, with the way to ask and the project's own page. */
function ComingSoon({ building }: { building: FinderBuilding }) {
  return (
    <div className="af-coming">
      <p className="af-coming-t">Становите за {building.project} наскоро ќе бидат објавени.</p>
      <div className="af-coming-act">
        <Button href={`/contact?project=${encodeURIComponent(building.projectId)}`} variant="primary">
          Закажи консултација
        </Button>
        <Link href={building.projectHref} className="af-coming-link">
          Страница на проектот <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
