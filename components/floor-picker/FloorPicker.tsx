"use client";

import "./floor-picker.css";
import { useRef, useState, type KeyboardEvent } from "react";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { ZoomNavLink } from "@/components/ui/ZoomTransition";
import { StatusMarker } from "@/components/ui/StatusBadge";
import { formatArea, statusLabel } from "@/lib/format";
import { roomsText } from "@/lib/plural";
import type { UnitStatus } from "@/types";

export interface PickerApartment {
  id: string;
  number: string;
  area: number;
  bedrooms: number;
  status: UnitStatus;
}

export interface PickerFloor {
  number: number;
  label: string;
  apartments: PickerApartment[];
}

/** More windows than this and a row spaces them tighter so they still fit beside the label. */
const DENSE_FROM = 7;

/**
 * "Избор на стан по кат": the building drawn as one row per floor (top floor first, one window per apartment) and,
 * beside it, the apartments of the chosen floor. Hovering a row with a mouse, or clicking / tapping it, chooses it;
 * Up and Down move the choice. It starts on the lowest floor that has a free apartment. The page passes the data
 * in as plain props, so nothing here knows where it comes from.
 */
export function FloorPicker({ floors, basePath }: { floors: PickerFloor[]; basePath?: string }) {
  const rows = [...floors].sort((a, b) => b.number - a.number);
  const lowestFirst = [...floors].sort((a, b) => a.number - b.number);
  // A floor with no apartments listed yet (the details are not here yet) is shown, with a short «soon» line in its panel.
  const start =
    lowestFirst.find((f) => f.apartments.some((a) => a.status === "available")) ??
    lowestFirst.find((f) => f.apartments.length > 0) ??
    lowestFirst[0];

  const [selected, setSelected] = useState(start?.number);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!start) return null;
  const current = rows.find((f) => f.number === selected) ?? start;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    const focused = rowRefs.current.findIndex((el) => el === document.activeElement);
    if (focused < 0) return;
    event.preventDefault();
    const next = Math.min(rows.length - 1, Math.max(0, focused + (event.key === "ArrowUp" ? -1 : 1)));
    setSelected(rows[next].number);
    rowRefs.current[next]?.focus();
  };

  return (
    <div className="fp">
      <div className="fp-facade">
        <div className="fp-cap" aria-hidden />
        <div className="fp-floors" role="group" aria-label="Катови" onKeyDown={onKeyDown}>
          {rows.map((floor, index) => (
            <button
              key={floor.number}
              ref={(el) => {
                rowRefs.current[index] = el;
              }}
              type="button"
              className="fp-floor"
              aria-pressed={floor.number === current.number}
              // one tab stop for the whole building; the arrow keys move inside it
              tabIndex={floor.number === current.number ? 0 : -1}
              onClick={() => setSelected(floor.number)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setSelected(floor.number);
              }}
            >
              <span>{floor.label}</span>
              <span aria-hidden className={`fp-wins${floor.apartments.length >= DENSE_FROM ? " is-dense" : ""}`}>
                {floor.apartments.map((a) => (
                  <i key={a.id} />
                ))}
              </span>
            </button>
          ))}
        </div>
        <div className="fp-base" aria-hidden />
      </div>

      <div className="fp-panel" aria-live="polite">
        <div className="fp-label">Избор на стан по кат</div>
        <h3 className="fp-title">{current.label}</h3>
        {current.apartments.length === 0 && <p className="fp-soon">Деталите за овој кат следуваат наскоро.</p>}
        {current.apartments.length > 0 && (
          <ul className="fp-units">
            {current.apartments.map((a) => (
              <li key={a.id}>
                <Link href={`/apartments/${a.id}`} className="fp-unit">
                  <b className="fp-unit-no">
                    <span className="sr-only">Стан </span>
                    {a.number}
                  </b>
                  <span className="fp-unit-spec">
                    {formatArea(a.area)} · {a.bedrooms === 0 ? "Студио" : roomsText(a.bedrooms)}
                  </span>
                  <span className={`fp-unit-st is-${a.status}`}>
                    <StatusMarker status={a.status} className="h-[7px] w-[7px]" />
                    {statusLabel(a.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {basePath && current.apartments.length > 0 && (
          <ZoomNavLink href={`${basePath}/${current.number}`} label={current.label} className="fp-floorlink">
            Погледни ја основата на катот
            <svg
              width="18"
              height="10"
              viewBox="0 0 18 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              aria-hidden
            >
              <path d="M0 5h17M13 1l4 4-4 4" />
            </svg>
          </ZoomNavLink>
        )}
      </div>
    </div>
  );
}
