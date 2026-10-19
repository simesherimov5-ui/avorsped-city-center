"use client";

import "./projects.css";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { getLenis } from "@/lib/lenis";
import { DUR } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { NoPhoto } from "@/components/ui/NoPhoto";
import { projectStatusLabel } from "@/lib/format";
import {
  CITY_PINS,
  choicesQuery,
  citiesWithCounts,
  filterProjects,
  groupByCity,
  parseChoices,
  projectsText,
  type CityFilter,
  type StatusFilter,
  type View,
} from "@/lib/project-explorer";
import type { Project } from "@/types";
import { PinIcon } from "./PinIcon";
import { ProjectsMap, type MapPin } from "./ProjectsMap";

const href = (p: Project) => p.href ?? `/projects/${p.slug}`;
const statusText = (p: Project) => p.statusLabelOverride ?? projectStatusLabel(p.status);
const statusClass = (p: Project) =>
  p.status === "completed" ? "is-done" : p.status === "upcoming" ? "is-soon" : "is-build";
/** The old cards fade out in this long (ms) before the new ones come in. */
const CARDS_OUT = 200;

/** The filter bar, the grid and the map of the projects page. The three choices live in the address (?status=&city=&view=). */
export function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const params = useSearchParams();
  // only the first address is read: after that the choices are kept here and written back to the address
  const [initial] = useState(() => parseChoices(params, projects));
  return <Explorer projects={projects} initial={initial} />;
}

function Explorer({
  projects,
  initial,
}: {
  projects: Project[];
  initial: { status: StatusFilter; city: CityFilter; view: View };
}) {
  const pathname = usePathname();
  const [status, setStatus] = useState<StatusFilter>(initial.status);
  const [city, setCity] = useState<CityFilter>(initial.city);
  const [view, setView] = useState<View>(initial.view);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // the first showing of the cards rises one after the other; after a choice the new cards come in quicker
  const [changed, setChanged] = useState(false);
  // the old cards are fading out (the new choice is applied when they are gone)
  const [leaving, setLeaving] = useState(false);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const bar = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const results = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const underline = useRef<HTMLSpanElement>(null);
  const timer = useRef(0);
  const cityBox = useRef<HTMLDivElement>(null);
  const listId = useId();

  const hasSoon = projects.some((p) => p.status === "upcoming");
  const tabs: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Сите" },
    { value: "build", label: "Во изградба" },
    { value: "done", label: "Завршени" },
    ...(hasSoon ? [{ value: "soon" as const, label: "Наскоро" }] : []),
  ];
  // The cities (in the list and on the map) and their counts follow the chosen status: only places that have a project
  // in that status are offered, each with the number of those projects.
  const inStatus = filterProjects(projects, status, "all");
  const cities = citiesWithCounts(inStatus);
  const options = [
    { city: "all", label: "Сите градови", count: inStatus.length },
    ...cities.map((c) => ({ ...c, label: c.city })),
  ];

  const shown = filterProjects(projects, status, city);
  const groups = groupByCity(shown);
  const pins: MapPin[] = cities
    .filter((c) => CITY_PINS[c.city])
    .map((c) => ({
      city: c.city,
      count: c.count === 1 ? "1 ПРОЕКТ" : `${c.count} ПРОЕКТИ`,
      x: CITY_PINS[c.city].x,
      y: CITY_PINS[c.city].y,
    }));

  const apply = (s: StatusFilter, c: CityFilter, v: View) => {
    setStatus(s);
    setCity(c);
    setView(v);
    setChanged(true);
    setLeaving(false);
    window.history.replaceState(null, "", `${pathname}${choicesQuery(s, c, v)}`);
  };

  /**
   * A choice from the bar. When the top of the list is out of view (the visitor is further down), the page first
   * scrolls up to it (below the navbar and the bar), so the change is seen; the old cards fade out (200ms) and the new
   * ones come in. With reduced motion the page jumps and the cards simply change.
   */
  const choose = (next: { status?: StatusFilter; city?: CityFilter; view?: View }) => {
    const s = next.status ?? status;
    let c = next.city ?? city;
    // a city with no project in the newly chosen status would leave the page empty: go back to all cities
    if (next.status && c !== "all" && !filterProjects(projects, s, "all").some((p) => p.city === c)) c = "all";
    const v = next.view ?? view;
    window.clearTimeout(timer.current);

    const list = results.current;
    const header = document.querySelector("header");
    const navH = header ? header.getBoundingClientRect().height : 0;
    const barH = bar.current ? bar.current.getBoundingClientRect().height : 0;
    // the list's top, under the navbar (which shows on the way up) and the bar stuck below it
    const target = list ? list.getBoundingClientRect().top + window.scrollY - navH - barH : 0;
    const outOfView = list ? list.getBoundingClientRect().top < navH + barH - 4 : false;

    if (reduce) {
      if (outOfView) window.scrollTo({ top: target, behavior: "auto" });
      apply(s, c, v);
      return;
    }
    setLeaving(true);
    let scrolled = !outOfView;
    let faded = false;
    const done = () => scrolled && faded && apply(s, c, v);
    timer.current = window.setTimeout(() => {
      faded = true;
      done();
    }, CARDS_OUT);
    if (outOfView) {
      const lenis = getLenis();
      const settle = () => {
        scrolled = true;
        done();
      };
      if (lenis) lenis.scrollTo(target, { duration: DUR.slow * 1.2, onComplete: settle });
      else {
        window.scrollTo({ top: target, behavior: "smooth" });
        window.setTimeout(settle, 600);
      }
    }
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The bar sticks below the navbar only while the list is on screen (it lives in the list's own wrapper). While it is
  // stuck it gets a soft shadow, and when the navbar slides away it slides up with it (CSS, by transform).
  useEffect(() => {
    const el = bar.current;
    const mark = sentinel.current;
    const wrap = el?.parentElement;
    if (!el || !mark || !wrap) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const top = parseFloat(getComputedStyle(el).top);
      if (Number.isNaN(top)) return void (el.dataset.stuck = "false"); // phones: not sticky
      const stuck =
        mark.getBoundingClientRect().top < top && wrap.getBoundingClientRect().bottom > top + el.offsetHeight + 1;
      el.dataset.stuck = String(stuck);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // The active tab's underline slides to the newly chosen tab (by transform).
  useLayoutEffect(() => {
    const group = tabsRef.current;
    const line = underline.current;
    const tab = group?.querySelector<HTMLElement>('.pj-tab[aria-pressed="true"]');
    if (!group || !line || !tab) return;
    const place = () => {
      line.style.transform = `translateX(${tab.offsetLeft}px) scaleX(${tab.offsetWidth})`;
    };
    place();
    // from the second placement on it slides
    requestAnimationFrame(() => line.classList.add("is-ready"));
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [status]);

  // A click outside the city list closes it.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!cityBox.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const onCityKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setActive(
          Math.max(
            0,
            options.findIndex((o) => o.city === city)
          )
        );
        setOpen(true);
        return;
      }
      setActive((i) => (e.key === "ArrowDown" ? Math.min(options.length - 1, i + 1) : Math.max(0, i - 1)));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      choose({ city: options[active].city });
      setOpen(false);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  const cityLabel = city === "all" ? "Сите градови" : city;
  const countLine = shown.length === 0 ? "Нема проекти за овој избор." : `Прикажани ${projectsText(shown.length)}`;

  return (
    <div className="pj-explorer grain">
      <div ref={sentinel} aria-hidden className="pj-sentinel" />
      <div ref={bar} className="pj-bar">
        <div className="pj-wrap pj-bar-inner">
          <div ref={tabsRef} className="pj-tabs">
            <span ref={underline} aria-hidden className="pj-tab-line" />
            {tabs.map((t) => (
              <button
                key={t.value}
                type="button"
                className="pj-tab"
                aria-pressed={status === t.value}
                onClick={() => choose({ status: t.value })}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="pj-bar-right">
            <div ref={cityBox} className="pj-city">
              <span className="eyebrow pj-city-label">ИЗБЕРЕТЕ ЛОКАЦИЈА</span>
              <button
                type="button"
                className="pj-city-btn"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={open ? `${listId}-${active}` : undefined}
                onClick={() => {
                  setActive(
                    Math.max(
                      0,
                      options.findIndex((o) => o.city === city)
                    )
                  );
                  setOpen((o) => !o);
                }}
                onKeyDown={onCityKey}
              >
                <PinIcon />
                <span>{cityLabel}</span>
                <svg viewBox="0 0 24 24" aria-hidden className="pj-chev">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {open && (
                <ul id={listId} role="listbox" aria-label="Градови" className="pj-list">
                  {options.map((o, i) => (
                    <li
                      key={o.city}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={o.city === city}
                      className={`pj-opt${i === active ? " is-active" : ""}`}
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={() => {
                        choose({ city: o.city });
                        setOpen(false);
                      }}
                    >
                      <PinIcon filled={o.city === city} />
                      <span>{o.label}</span>
                      <span className="pj-opt-count">{o.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pj-views">
              <button
                type="button"
                className="pj-view-btn"
                aria-label="Листа"
                aria-pressed={view === "grid"}
                onClick={() => choose({ view: "grid" })}
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <rect x="4" y="4" width="7" height="7" />
                  <rect x="13" y="4" width="7" height="7" />
                  <rect x="4" y="13" width="7" height="7" />
                  <rect x="13" y="13" width="7" height="7" />
                </svg>
              </button>
              <button
                type="button"
                className="pj-view-btn"
                aria-label="Мапа"
                aria-pressed={view === "map"}
                onClick={() => choose({ view: "map" })}
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" />
                  <circle cx="12" cy="10" r="2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <section ref={results} className="pj-wrap pj-results">
        <div className="pj-count" role="status" aria-live="polite">
          {countLine}
        </div>

        {view === "grid" && shown.length > 0 && (
          <div key={`grid-${status}-${city}`} className={leaving ? "pj-groups is-leaving" : "pj-groups"}>
            {groups.map((group) => {
              let n = 0;
              return (
                <div key={group.city || "none"}>
                  {group.city && (
                    <h2 className="pj-group-head">
                      <PinIcon />
                      <span className="pj-group-name">{group.city}</span>
                      <span className="pj-group-count">{projectsText(group.projects.length)}</span>
                    </h2>
                  )}
                  <div className="pj-grid">
                    {group.projects.map((project) => (
                      <GridCard
                        key={project.id}
                        project={project}
                        delay={changed ? n++ * 0.04 : n++ * 0.05}
                        swap={changed}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "map" && (
          <div key={`map-${status}-${city}`} className={cnView(changed, leaving)}>
            <ProjectsMap pins={pins} selected={city} onPick={(c) => choose({ city: c })} />
            <div className="pj-rows">
              {groups.map((group) => (
                <div key={group.city || "none"} className="pj-rows-group">
                  {group.city && (
                    <div className="eyebrow pj-rows-head">
                      <PinIcon />
                      {group.city}
                    </div>
                  )}
                  {group.projects.map((project) => (
                    <Link key={project.id} href={href(project)} className="pj-row">
                      <span className="pj-thumb">
                        {project.heroImage.isPlaceholder ? (
                          <NoPhoto />
                        ) : (
                          <span className="pj-img">
                            <Media
                              image={project.heroImage}
                              tone="dark"
                              fit={project.imageFit ?? "cover"}
                              focus={project.imageFocus}
                              className="h-full w-full !bg-transparent"
                              sizes="96px"
                              defer
                            />
                          </span>
                        )}
                      </span>
                      <span className="pj-row-text">
                        <span className="pj-row-name">{project.name}</span>
                        <span className="pj-row-meta">
                          {project.city} · <span className={statusClass(project)}>{statusText(project)}</span>
                        </span>
                      </span>
                      <span className="pj-arrow" aria-hidden>
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

const cnView = (changed: boolean, leaving: boolean) =>
  ["pj-map-view", changed && "pj-view", leaving && "is-leaving"].filter(Boolean).join(" ");

function GridCard({ project, delay, swap = false }: { project: Project; delay?: number; swap?: boolean }) {
  return (
    <Link
      href={href(project)}
      className={`pj-card${delay !== undefined ? (swap ? " is-swapping" : " is-rising") : ""}`}
      style={delay !== undefined ? { animationDelay: `${delay.toFixed(2)}s` } : undefined}
    >
      <div className="pj-photo">
        {project.heroImage.isPlaceholder ? (
          <NoPhoto />
        ) : (
          <div className="pj-img">
            <Media
              image={project.heroImage}
              label={project.name}
              tone="dark"
              fit={project.imageFit ?? "cover"}
              focus={project.imageFocus}
              className="h-full w-full !bg-transparent"
              // the photo is drawn wider than its card (the crop of a wide photo, and the project's own zoom)
              sizes="(max-width: 767px) 160vw, (max-width: 1100px) 100vw, 620px"
              defer
            />
          </div>
        )}
        <div className="pj-photo-scrim" />
        <span className={`pj-chip ${statusClass(project)}`}>
          <i />
          {statusText(project)}
        </span>
        {project.city && <span className="pj-photo-city">{project.city}</span>}
      </div>
      <div className="pj-title-row">
        <span className="pj-name">{project.name}</span>
        <span className="pj-arrow" aria-hidden>
          →
        </span>
      </div>
      <div className="pj-rule">
        <i />
      </div>
      {project.tagline && <p className="pj-tagline">{project.tagline}</p>}
    </Link>
  );
}
