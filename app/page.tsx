import { Hero } from "@/components/Hero";
import { Reveal as ScrollReveal } from "@/components/motion/Reveal";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { PullQuote } from "@/components/ui/PullQuote";
import { Manifest } from "@/components/home/Manifest";
import { Film } from "@/components/home/Film";
import { NewProjects } from "@/components/home/NewProjects";
import { Numbers } from "@/components/home/Numbers";
import { Differences } from "@/components/home/Differences";
import { Soon } from "@/components/home/Soon";
import { Quotes } from "@/components/home/Quotes";
import { ClosingGlass } from "@/components/home/ClosingGlass";
import { projects, companyInfo, residentQuotes } from "@/data";
import type { Metadata } from "next";

// TODO(client): the film is not made yet; until it is, the frame shows this aerial view of City Center.
const FILM_STILL = { src: "/images/site/masterplan-aerial.jpg", alt: "City Center — поглед од воздух" };

// TODO(client): these two numbers are provisional (docs/content-needed.md); the years are counted from the founding year.
const FIGURES = [
  { target: 40, label: "Завршени објекти" },
  { target: 8000, suffix: "+", label: "m² изградени" },
];

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
      <NewProjects projects={projects.filter((p) => p.status !== "completed")} />

      {/* 5. The numbers */}
      <section className="border-t border-on-chrome/10 bg-chrome text-on-chrome">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-[70px] sm:px-8 sm:pb-24 lg:px-10">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="eyebrow text-accent">Од {companyInfo.founded}</div>
                <h2 className="mt-3 font-display text-(length:--fs-h2) font-normal leading-[1.2]">
                  Изградени на доверба.
                </h2>
              </div>
              <Link href="/about" className="btn-tertiary focus-ring">
                Нашата приказна
              </Link>
            </div>
          </ScrollReveal>
          <div className="mt-12">
            <Numbers founded={companyInfo.founded} figures={FIGURES} />
          </div>
        </div>
      </section>

      {/* Words of the residents (no section while there are no quotes) */}
      <Quotes quotes={residentQuotes} />

      {/* 6. What sets us apart */}
      <Differences />

      {/* 7. Something new is coming */}
      <Soon />

      {/* A line the company stands behind, on the dark */}
      <section className="bg-chrome py-20 text-on-chrome sm:py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
          <ScrollReveal>
            <PullQuote>„Зад нас стојат дела. Пред нас — визија.“</PullQuote>
            <Link href="/about" className="btn-tertiary focus-ring mt-10">
              За нас
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* 8. The ending: a pane of glass over the building mark */}
      <ClosingGlass phone={companyInfo.phone} email={companyInfo.email} />
    </>
  );
}
