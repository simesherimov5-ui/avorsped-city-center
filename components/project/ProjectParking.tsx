import { Reveal } from "@/components/ui/Reveal";
import { ProjectSection, SectionHead } from "@/components/project/SectionHead";
import type { Project } from "@/types";

/** "Паркинг": the idea in words on the left, a simple drawing of a garage on the right. */
export function ProjectParking({ project }: { project: Project }) {
  const parking = project.parking;
  if (!parking) return null;
  return (
    <ProjectSection label="Паркинг">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHead eyebrow="ПАРКИНГ" title={parking.title} titleItalic={parking.titleItalic}>
            <p className="m-0 max-w-[62ch] text-base leading-[1.8] text-ink/80">{parking.text}</p>
          </SectionHead>
        </Reveal>
        <Reveal delay={0.12}>
          <figure className="m-0 border border-line bg-espresso p-6 sm:p-8">
            <GarageDrawing />
            <figcaption className="eyebrow eyebrow-tight mt-5 text-center text-muted">
              [ ПОЕДНОСТАВЕНА ОСНОВА НА ГАРАЖАТА ]
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </ProjectSection>
  );
}

/** A line drawing of a garage: two rows of bays, a dashed driving line with an arrow between them, two bays picked out in the accent. */
function GarageDrawing() {
  const bays = Array.from({ length: 8 }, (_, i) => 20 + i * 45);
  const picked = new Set([2, 13]);
  return (
    <svg viewBox="0 0 400 220" role="img" aria-label="Поедноставена основа на гаражата" className="block h-auto w-full">
      <rect x="10" y="10" width="380" height="200" fill="none" stroke="var(--color-on-chrome)" strokeOpacity="0.4" />
      {[0, 1].map((row) =>
        bays.map((x, i) => {
          const n = row * 8 + i;
          const y = row === 0 ? 24 : 136;
          const on = picked.has(n);
          return (
            <rect
              key={n}
              x={x}
              y={y}
              width="38"
              height="60"
              fill={on ? "var(--color-copper)" : "none"}
              fillOpacity={on ? 0.28 : 0}
              stroke={on ? "var(--color-copper)" : "var(--color-on-chrome)"}
              strokeOpacity={on ? 1 : 0.45}
            />
          );
        })
      )}
      <path d="M28 110 H360" fill="none" stroke="var(--color-on-chrome)" strokeOpacity="0.7" strokeDasharray="6 6" />
      <path d="M352 104 L362 110 L352 116" fill="none" stroke="var(--color-on-chrome)" strokeOpacity="0.7" />
    </svg>
  );
}
