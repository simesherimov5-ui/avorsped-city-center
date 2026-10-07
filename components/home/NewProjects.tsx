import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import type { Project } from "@/types";

/** "City Center" becomes "City " and "Center": the last word is set in italic Светол бакар. */
function splitName(name: string) {
  const at = name.lastIndexOf(" ");
  return at < 0 ? { lead: name, last: "" } : { lead: name.slice(0, at + 1), last: name.slice(at + 1) };
}

/**
 * "Во изградба сега": the projects being built now, each on a large card with its photo, a line about it, three facts
 * and the way in. The facts come from the project's own data.
 */
export function NewProjects({ projects }: { projects: Project[] }) {
  return (
    <section id="new" className="bg-chrome text-on-chrome">
      <div className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span aria-hidden className="block h-2 w-2 rounded-full bg-accent" />
                <div className="eyebrow text-accent">Ново · во продажба</div>
              </div>
              <h2 className="mt-4 font-display text-[clamp(34px,4.2vw,60px)] font-normal leading-[1.04]">
                Во изградба <em className="italic text-accent">сега.</em>
              </h2>
            </div>
            <Link
              href="/projects"
              className="focus-ring inline-flex min-h-11 items-center border-b border-accent pb-1 text-xs font-semibold uppercase tracking-[0.32em] text-accent"
            >
              Сите проекти →
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 flex flex-col gap-8">
          {projects.map((project, i) => {
            const href = project.href ?? `/projects/${project.slug}`;
            const { lead, last } = splitName(project.name);
            return (
              <Reveal key={project.id} delay={i * 0.08}>
                <article className="grid bg-espresso lg:grid-cols-[1.45fr_1fr]">
                  <Link
                    href={href}
                    tabIndex={-1}
                    aria-hidden
                    className="relative block aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[500px]"
                  >
                    <Media
                      image={project.heroImage}
                      label={`${project.name} — визуелизација`}
                      fit={project.imageFit}
                      focus={project.imageFocus}
                      tone="dark"
                      defer
                      sizes="(max-width: 1024px) 100vw, 760px"
                      className="h-full w-full"
                    />
                  </Link>
                  <div className="flex flex-col justify-between gap-8 p-8 sm:p-10 lg:p-12">
                    <div>
                      <h3 className="font-display text-[clamp(34px,3.4vw,48px)] font-normal leading-[1.02]">
                        {lead}
                        {last && <em className="italic text-accent">{last}</em>}
                      </h3>
                      {project.tagline && (
                        <p className="mt-4 text-[15px] font-light leading-[1.75] text-on-chrome/70">
                          {project.tagline}
                        </p>
                      )}
                    </div>
                    <dl className="text-[13px]">
                      <Fact label="Локација" value={project.location} />
                      <Fact label="Станови" value={String(project.units)} />
                      <Fact label="Вселување" value={String(project.year)} last />
                    </dl>
                    <div>
                      <Button href={href} variant="primary" tone="dark">
                        Откријте го проектот
                      </Button>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Fact({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={`flex items-baseline justify-between gap-6 border-t border-on-chrome/15 py-3.5 ${last ? "border-b" : ""}`}
    >
      <dt className="text-on-chrome/70">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
