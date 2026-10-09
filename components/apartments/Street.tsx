"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { availableWord } from "@/lib/plural";
import { streetUnits, type FinderApartment, type FinderBuilding } from "@/lib/apartment-finder";
import { Tower } from "./Tower";

/**
 * Every building as a small drawing in one row on a ground line, grouped by project, one window per apartment. A
 * building is chosen by clicking it (again to choose none); only the chosen one is lit and plays the rise. When the
 * street cannot fit even at its smallest size it scrolls sideways inside its own box, and says so.
 */
export function Street({
  buildings,
  apartments,
  selected,
  playing,
  onSelect,
}: {
  buildings: FinderBuilding[];
  apartments: Map<string, FinderApartment>;
  /** The chosen building's id, or "all". */
  selected: string;
  /** The building that has just been chosen by the visitor: only that one plays the rise and the lighting. */
  playing: string | null;
  onSelect: (id: string) => void;
}) {
  const { units, pixels, height } = streetUnits(buildings);
  const groups: { project: string; items: FinderBuilding[] }[] = [];
  for (const b of buildings) {
    const group = groups.find((g) => g.project === b.project);
    if (group) group.items.push(b);
    else groups.push({ project: b.project, items: [b] });
  }

  const scroller = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    // The size of a window (u) is the largest, between 7px and 14px (and low enough for the tallest building to stay
    // under 240px), at which the whole street still fits the box. The stylesheet has an estimate from the number of
    // windows; this finds the exact size, because the names and captions are text of a width nobody can compute.
    const fit = () => {
      const street = box.firstElementChild as HTMLElement | null;
      if (!street) return;
      const tallest = Number.parseFloat(box.style.getPropertyValue("--h")) || 1;
      let low = 7;
      let high = Math.max(7, Math.min(14, 236 / tallest));
      for (let i = 0; i < 9; i++) {
        const mid = (low + high) / 2;
        box.style.setProperty("--u", `${mid}px`);
        if (street.scrollWidth <= box.clientWidth) low = mid;
        else high = mid;
      }
      box.style.setProperty("--u", `${low}px`);
    };
    const measure = () => {
      fit();
      setScrolls(box.scrollWidth > box.clientWidth + 2);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    void fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, []);

  const availableIn = (b: FinderBuilding) =>
    b.floors.reduce(
      (sum, f) => sum + f.apartmentIds.filter((id) => apartments.get(id)?.status === "available").length,
      0
    );

  return (
    <>
      <div
        ref={scroller}
        className="af-street-scroll"
        style={{ "--n": units, "--k": `${pixels}px`, "--h": height } as CSSProperties}
      >
        <div className={`af-street${selected !== "all" ? " has-sel" : ""}`}>
          <i className="af-ground" aria-hidden />
          {groups.map((group) => (
            <div key={group.project} className="af-grp">
              <div className="af-grp-h eyebrow">{group.project}</div>
              <div className="af-grp-row">
                {group.items.map((b) => {
                  const free = availableIn(b);
                  const on = selected === b.id;
                  const label = `${b.name}${b.project !== b.name ? `, ${b.project}` : ""}, ${
                    b.coming ? "наскоро" : `${free} ${availableWord(free)}`
                  }`;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className={`af-bld${on ? " is-sel is-lit" : ""}${on && playing === b.id ? " is-play" : ""}`}
                      aria-pressed={on}
                      aria-label={label}
                      onClick={() => onSelect(on ? "all" : b.id)}
                    >
                      <Tower building={b} apartments={apartments} />
                      <span className="af-bld-label" aria-hidden>
                        <b>{b.name}</b>
                        <small className="af-num">{b.coming ? "Наскоро" : `${free} ${availableWord(free)}`}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="af-swipe" hidden={!scrolls}>
        Повлечи настрана за сите згради
      </p>
    </>
  );
}
