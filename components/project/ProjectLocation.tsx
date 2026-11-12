import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { realText } from "@/lib/format";
import type { Project } from "@/types";

/**
 * "Локација" on the cream page: on the left the heading (its end in Бронза) and the places near the project, one row
 * each under a thin line, the distance on the right when the data has it; on the right the map the page brings (`map`),
 * as tall as the left column (at least 480px; 4:3 on a phone, under the list). `places` defaults to the project's own
 * walking list (rows still waiting for their text are left out).
 */
export function ProjectLocation({
  project,
  places,
  map,
}: {
  project: Project;
  places?: { name: string; distance?: string }[];
  map?: ReactNode;
}) {
  const walking = project.walking;
  if (!walking) return null;
  const rows = (places ?? walking.places.map((p) => ({ name: p.name, distance: p.time }))).filter((p) =>
    realText(p.name)
  );
  return (
    <section aria-label="Локација" className="on-light grain">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-stretch gap-14 px-[5%] pb-[72px] pt-[88px] md:pb-[120px] md:pt-[140px]">
        <div className="min-w-0 flex-[1_1_360px]">
          <Reveal>
            <div className="flex flex-col gap-4">
              <div className="eyebrow tracking-[0.32em] text-gold-deep">ЛОКАЦИЈА</div>
              <h2 className="m-0 font-display text-[length:calc(clamp(38px,4.4vw,62px)*var(--type-scale,1))] font-normal leading-[1.05] text-ink">
                {walking.title}
                {realText(walking.titleItalic) && <span className="text-gold-deep">{walking.titleItalic}</span>}
              </h2>
            </div>
            {rows.length > 0 && (
              <ul className="mt-3 list-none p-0">
                {rows.map((place) => (
                  <li key={place.name} className="flex items-baseline justify-between gap-4 border-b border-line py-4">
                    <span className="font-display text-xl text-ink">{place.name}</span>
                    {realText(place.distance) && (
                      <span className="shrink-0 text-label tracking-[0.16em] text-gold-deep">{place.distance}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </div>
        {map && <div className="flex min-w-0 flex-[1_1_520px] flex-col">{map}</div>}
      </div>
    </section>
  );
}
