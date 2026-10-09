"use client";

import "./projects.css";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
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
  // the first showing of the cards rises one after the other; after a choice the whole view fades in instead
  const [changed, setChanged] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
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

  const choose = (next: { status?: StatusFilter; city?: CityFilter; view?: View }) => {
    const s = next.status ?? status;
    let c = next.city ?? city;
    // a city with no project in the newly chosen status would leave the page empty: go back to all cities
    if (next.status && c !== "all" && !filterProjects(projects, s, "all").some((p) => p.city === c)) c = "all";
    const v = next.view ?? view;
    setStatus(s);
    setCity(c);
    setView(v);
    setChanged(true);
    window.history.replaceState(null, "", `${pathname}${choicesQuery(s, c, v)}`);
  };

  // The bar sticks right under the navbar, wherever the navbar really is: it slides away on the way down and back on
  // the way up, so its measured bottom edge is followed for a moment after every scroll.
  useEffect(() => {
    const el = bar.current;
    const header = document.querySelector("header");
    if (!el || !header) return;
    let frame = 0;
    let until = 0;
    const place = () => {
      el.style.setProperty("--pj-top", `${Math.max(0, Math.round(header.getBoundingClientRect().bottom))}px`);
    };
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
    <>
      <div ref={bar} className="pj-bar">
        <div className="pj-wrap pj-bar-inner">
          <div className="pj-tabs">
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

      <section className="pj-wrap pj-results">
        <div className="pj-count" role="status" aria-live="polite">
          {countLine}
        </div>

        {view === "grid" && shown.length > 0 && (
          <div key={`grid-${status}-${city}`} className={changed ? "pj-view pj-groups" : "pj-groups"}>
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
                      <GridCard key={project.id} project={project} delay={changed ? undefined : n++ * 0.09} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "map" && (
          <div key={`map-${status}-${city}`} className={changed ? "pj-view pj-map-view" : "pj-map-view"}>
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
    </>
  );
}

function GridCard({ project, delay }: { project: Project; delay?: number }) {
  return (
    <Link
      href={href(project)}
      className={`pj-card${delay !== undefined ? " is-rising" : ""}`}
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
