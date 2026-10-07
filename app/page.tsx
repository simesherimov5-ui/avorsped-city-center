import { Hero } from "@/components/Hero";
import { Media } from "@/components/ui/Media";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Reveal as ScrollReveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { PullQuote } from "@/components/ui/PullQuote";
import { Manifest } from "@/components/home/Manifest";
import { Film } from "@/components/home/Film";
import { NewProjects } from "@/components/home/NewProjects";
import { Numbers } from "@/components/home/Numbers";
import { Differences } from "@/components/home/Differences";
import { Soon } from "@/components/home/Soon";
import { projects, companyInfo } from "@/data";
import type { Metadata } from "next";

// TODO(client): the film is not made yet; until it is, the frame shows this aerial view of City Center.
const FILM_STILL = { src: "/images/site/masterplan-aerial.jpg", alt: "City Center — поглед од воздух" };

// TODO(client): these two numbers are provisional (docs/content-needed.md); the years are counted from the founding year.
const FIGURES = [
  { value: "40", label: "Завршени објекти" },
  { value: "8.000+", label: "m² изградени" },
];

const CTA_IMAGE = {
  src: "/images/exteriors/exterior-01-dusk.jpg",
  alt: "Јавор Шпед — вечерна визуелизација",
  isPlaceholder: false,
};

// The home page keeps the site-wide title and description from the layout; it only needs its own canonical link.
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <>
      {/* 1. Hero — who we are */}
      <Hero />

      {/* 2. What we believe */}
      <Manifest />

      {/* 3. The film */}
      <Film still={FILM_STILL} />

      {/* 4. What is being built now */}
      <NewProjects projects={projects.filter((p) => p.status === "under-construction")} />

      {/* 5. The numbers */}
      <section className="border-t border-on-chrome/10 bg-chrome text-on-chrome">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="eyebrow text-accent">Од {companyInfo.founded}</div>
                <h2 className="mt-4 font-display text-[clamp(34px,4.2vw,60px)] font-normal leading-[1.04]">
                  Изградени <em className="italic text-accent">на доверба.</em>
                </h2>
              </div>
              <Link
                href="/about"
                className="focus-ring inline-flex min-h-11 items-center border-b border-accent pb-1 text-xs font-semibold uppercase tracking-[0.32em] text-accent"
              >
                Нашата приказна
              </Link>
            </div>
          </ScrollReveal>
          <div className="mt-14">
            <Numbers founded={companyInfo.founded} figures={FIGURES} />
          </div>
        </div>
      </section>

      {/* 6. What sets us apart */}
      <Differences />

      {/* 7. Something new is coming */}
      <Soon />

      {/* A line the company stands behind, on the dark */}
      <section className="bg-chrome py-24 text-on-chrome sm:py-32">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
          <ScrollReveal>
            <PullQuote>„Зад нас стојат дела. Пред нас — визија.“</PullQuote>
            <Link
              href="/about"
              className="focus-ring mt-10 inline-flex min-h-11 items-center border-b border-accent pb-1 text-xs font-semibold uppercase tracking-[0.32em] text-accent"
            >
              За нас
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. Final CTA — a clear, project-agnostic path to contact */}
      <section className="relative overflow-hidden bg-chrome py-28 text-center text-on-chrome sm:py-36">
        <div className="absolute inset-0">
          <ParallaxImage>
            <Media
              image={CTA_IMAGE}
              tone="dark"
              className="h-full w-full opacity-35"
              sizes="(max-width: 767px) 160vw, 100vw"
            />
          </ParallaxImage>
          <div className="absolute inset-0 bg-chrome/70" />
        </div>
        <ScrollReveal>
          <div className="relative mx-auto max-w-xl px-5 sm:px-8 lg:px-10">
            <div className="eyebrow text-accent">Следен чекор</div>
            <h2 className="t-h2 mt-4">„Вашето следно поглавје започнува тука.“</h2>
            <p className="mx-auto mt-5 max-w-md text-on-chrome/70">
              Разговарајте со нашиот тим за продажба за кој било од нашите проекти.
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
              <Button href="/contact" variant="primary" tone="dark">
                Закажи консултација
              </Button>
              <Button href="/projects" variant="secondary" tone="dark">
                Погледни ги проектите
              </Button>
            </div>
            <div className="mt-6 flex flex-col items-center sm:mt-8 sm:flex-row sm:justify-center sm:gap-2">
              <a
                href={`tel:${companyInfo.phone.replace(/ /g, "")}`}
                className="focus-ring flex min-h-11 items-center px-2 text-base text-on-chrome/70 hover:text-on-chrome sm:text-sm"
              >
                {companyInfo.phone}
              </a>
              <span className="hidden text-on-chrome/62 sm:inline" aria-hidden>
                ·
              </span>
              <a
                href={`mailto:${companyInfo.email}`}
                className="focus-ring flex min-h-11 items-center px-2 text-base text-on-chrome/70 hover:text-on-chrome sm:text-sm"
              >
                {companyInfo.email}
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
