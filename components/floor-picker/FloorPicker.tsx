"use client";

import "./floor-picker.css";
import { useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { usePageTransition } from "@/components/page-transition/PageTransition";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { ZoomNavLink } from "@/components/ui/ZoomTransition";
import { floorTitle } from "@/lib/floor";
import { formatArea } from "@/lib/format";
import { roomsText } from "@/lib/plural";
import { FloorSketch } from "@/components/floor-sketch/FloorSketch";
import type { ApartmentOutline, DrawingImage } from "@/types";

export interface PickerApartment {
  id: string;
  number: string;
  area: number;
  areaDecimals?: number;
  bedrooms: number;
  /** Where it is on its floor's sketch, for its shape there. */
  outline?: ApartmentOutline;
}

export interface PickerFloor {
  number: number;
  label: string;
  apartments: PickerApartment[];
  /** This floor's own sketch, where there is one. */
  sketch?: DrawingImage;
}

/** More windows than this and a row spaces them tighter so they still fit beside the label. */
const DENSE_FROM = 7;

/**
 * "Избор на стан по кат": the building drawn as one row per floor (top floor first, one window per apartment) with the
 * apartments of the chosen floor listed under it and, beside it, the floor's sketch. Hovering a row with a mouse, or clicking / tapping it, chooses it;
 * Up and Down move the choice. It starts on the lowest floor that has apartments. The page passes the data
 * in as plain props, so nothing here knows where it comes from.
 * With `pickOpensFloor` (the building page) a click, tap or Enter on a floor opens that floor's page (`basePath`/number) at
 * once; a mouse hovering the rows still previews each floor.
 */
export function FloorPicker({
  floors,
  basePath,
  pickOpensFloor = false,
}: {
  floors: PickerFloor[];
  basePath?: string;
  pickOpensFloor?: boolean;
}) {
  const rows = [...floors].sort((a, b) => b.number - a.number);
  const lowestFirst = [...floors].sort((a, b) => a.number - b.number);
  // A floor with no apartments listed yet (the details are not here yet) is shown, with a short «soon» line in its panel.
  const start = lowestFirst.find((f) => f.apartments.length > 0) ?? lowestFirst[0];

  const [selected, setSelected] = useState(start?.number);
  // the apartment the pointer or the keyboard is on, in the sketch or in the list: both light up
  const [hot, setHot] = useState<string | null>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const transition = usePageTransition();
  const router = useRouter();

  if (!start) return null;
  const current = rows.find((f) => f.number === selected) ?? start;
  // A floor with a sketch and shapes shows the sketch in the panel; a building without them shows the list only.
  const hasSketch = floors.some((f) => f.sketch && f.apartments.some((a) => a.outline));
  const currentSketch = current.sketch && current.apartments.some((a) => a.outline) ? current.sketch : undefined;

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
    <div className={`fp${hasSketch ? " has-sketch" : ""}`}>
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
              onClick={() => {
                setSelected(floor.number);
                if (!pickOpensFloor || !basePath) return;
                const href = `${basePath}/${floor.number}`;
                if (transition) transition.navigate(href);
                else router.push(href);
              }}
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
        {current.apartments.length > 0 && (
          // keyed by the floor, so the list fades in again whenever the floor changes
          <ul key={current.number} className="fp-apts" aria-label={`Станови — ${floorTitle(current.label)}`}>
            {current.apartments.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/development/apartment/${a.id}`}
                  className={`fp-apt${hot === a.id ? " is-hot" : ""}`}
                  onMouseEnter={() => setHot(a.id)}
                  onMouseLeave={() => setHot(null)}
                  onFocus={() => setHot(a.id)}
                  onBlur={() => setHot(null)}
                >
                  <span>
                    <span className="fp-apt-lbl">Стан</span> {a.number}
                  </span>
                  <span className="fp-apt-spec">
                    {formatArea(a.area, a.areaDecimals)} · {a.bedrooms === 0 ? "Студио" : roomsText(a.bedrooms)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fp-panel" aria-live="polite">
        <div className="fp-label">Избор на стан по кат</div>
        <h3 className="fp-title">{floorTitle(current.label)}</h3>
        {currentSketch && (
          <FloorSketch
            image={currentSketch}
            apartments={current.apartments}
            levelKey={current.number}
            hovered={hot}
            onHover={setHot}
            priority={false}
          />
        )}
        {current.apartments.length === 0 && <p className="fp-soon">Деталите за овој кат следуваат наскоро.</p>}
        {basePath && current.apartments.length > 0 && (
          <ZoomNavLink
            href={`${basePath}/${current.number}`}
            label={floorTitle(current.label)}
            className="fp-floorlink"
          >
            Погледнете ја основата на катот
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
