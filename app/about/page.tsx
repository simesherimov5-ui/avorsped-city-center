import type { Metadata } from "next";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { companyInfo, companyStats, companyTimeline, projects } from "@/data";
import { COMPANIES, THIS_COMPANY } from "@/components/company-ticker/companies";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { RevealHeading } from "@/components/motion/RevealHeading";
import { ProjectCard } from "@/components/ProjectCard";
import { StatsRow } from "@/components/about/StatsRow";
import { ValueCards } from "@/components/about/ValueCards";
import { Timeline } from "@/components/about/Timeline";
import { CompanyBoxes } from "@/components/about/CompanyBoxes";

export const metadata: Metadata = {
  title: "За нас",
  description:
    "Дознајте повеќе за Јавор Шпед и Exclusive Building — нашата приказна, мисија, вредности и завршени проекти.",
};

const BRAND_IMAGE = {
  src: "/images/brand/holding-since-1994.jpg",
  alt: "Јавор Шпед, основан 1994",
  isPlaceholder: false,
};

// Section rhythm: 140px between sections on desktop, 72px on phones. Bands (ink) carry the full padding;
// paper sections carry half, so two paper sections in a row are still 140 / 72 apart.
const BAND = "py-[72px] lg:py-[140px]";
const PAPER = "py-9 lg:py-[70px]";
const WRAP = "mx-auto max-w-6xl px-5 sm:px-8 lg:px-10";

export default function AboutPage() {
  return (
    <div>
      <section className="bg-ink pb-[72px] pt-32 text-paper lg:pb-[140px] lg:pt-40">
        <div className={`${WRAP} grid items-center gap-12 lg:grid-cols-2 lg:gap-16`}>
          <Reveal>
            <Media image={BRAND_IMAGE} tone="dark" className="aspect-[4/5]" />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="eyebrow eyebrow-ruled text-gold">Основано 1994</div>
            <RevealHeading as="h1" className="mt-5 font-display text-4xl leading-[1.1] sm:text-5xl">
              Три децении на Јавор Шпед.
            </RevealHeading>
            <p className="mt-6 max-w-lg text-lead leading-relaxed text-paper/70">{companyInfo.story}</p>
            <Link
              href="/projects"
              className="focus-ring mt-8 inline-flex min-h-11 items-center border-b border-gold pb-1 text-sm uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-light"
            >
              Погледни ги проектите →
            </Link>
          </Reveal>
        </div>
      </section>

      <section className={PAPER}>
        <div className={WRAP}>
          <Reveal>
            <div className="eyebrow eyebrow-ruled text-gold-deep">Мисија</div>
            <p className="mt-5 max-w-3xl font-display text-2xl leading-snug lg:text-[2rem]">{companyInfo.mission}</p>
          </Reveal>
          <div className="mt-12 lg:mt-16">
            <StatsRow stats={companyStats} />
          </div>
        </div>
      </section>

      <section className={PAPER}>
        <div className={WRAP}>
          <div className="eyebrow eyebrow-ruled text-gold-deep">Нашите вредности</div>
          <RevealHeading as="h2" className="mt-4 font-display text-3xl sm:text-[2.75rem]">
            За што се залагаме
          </RevealHeading>
          <div className="mt-10 lg:mt-14">
            <ValueCards values={companyInfo.values} />
          </div>
        </div>
      </section>

      <section className={`bg-ink text-paper ${BAND}`}>
        <div className={WRAP}>
          <div className="eyebrow eyebrow-ruled text-gold">Историја</div>
          <RevealHeading as="h2" className="mt-4 font-display text-3xl sm:text-[2.75rem]">
            Нашиот пат
          </RevealHeading>
          <div className="mt-10 lg:mt-14">
            <Timeline milestones={companyTimeline} />
          </div>

          <div className="mt-[72px] lg:mt-[140px]">
            <div className="eyebrow eyebrow-ruled text-gold">Групацијата</div>
            <RevealHeading as="h2" className="mt-4 font-display text-3xl sm:text-[2.75rem]">
              Дел од Јавор Шпед
            </RevealHeading>
            <p className="mt-4 max-w-2xl text-base text-paper/70">
              Exclusive Building работи заедно со овие компании во рамки на групацијата Јавор Шпед.
            </p>
            <div className="mt-10 lg:mt-14">
              <CompanyBoxes companies={COMPANIES} highlight={THIS_COMPANY} thisLabel="Оваа компанија" />
            </div>
          </div>
        </div>
      </section>

      <section className={PAPER}>
        <div className={WRAP}>
          <div className="eyebrow eyebrow-ruled text-gold-deep">Портфолио</div>
          <RevealHeading as="h2" className="mt-4 font-display text-3xl sm:text-[2.75rem]">
            Она што го градиме сега
          </RevealHeading>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-chrome py-16 text-center text-on-chrome sm:py-20">
        <h2 className="font-display text-3xl">Сакате да дознаете повеќе?</h2>
        <div className="mt-8">
          <Button href="/contact" variant="primary">
            Контактирајте нè
          </Button>
        </div>
      </section>
    </div>
  );
}
