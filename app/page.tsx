import { Hero } from "@/components/Hero";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { Media } from "@/components/ui/Media";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal as ScrollReveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { YearCounter } from "@/components/YearCounter";
import { PullQuote } from "@/components/ui/PullQuote";
import { projects, companyInfo } from "@/data";
import type { Metadata } from "next";

// Two things a buyer should know about how we build, each in the company's own words.
const WHY_US = [
  {
    title: "Квалитетна изградба",
    paragraphs: [
      "Квалитетот на еден дом се препознава во вниманието со кое е создаден и во вредноста што ја задржува низ годините. Затоа, на секој наш проект му пристапуваме со одговорност и посветеност — од првичната замисла и изборот на материјали до прецизната изведба на секој детал.",
      "Со внимателно планирање и високи стандарди во изградбата, создаваме домови во кои естетиката, функционалноста и долготрајноста се надополнуваат. Зад секоја наша одлука стои јасна цел: да ви обезбедиме сигурен и удобен простор за живеење, во кој вие и вашето семејство ќе ја градите својата иднина со доверба.",
    ],
  },
  {
    title: "Уникатни решенија и удобност",
    paragraphs: [
      "Добрата архитектура се чувствува во леснотијата со која го користите просторот. Во распоредот што ви одговара, во можноста да го уредите според својот вкус и во удобноста што останува подеднакво важна низ годините.",
      "Нашите станбени решенија произлегуваат од внимателно разгледување на различните потреби на современото живеење. Заедно со архитекти и дизајнери, ги усогласуваме пропорциите, намената и поврзаноста на просториите, за секој стан да понуди практичност, приватност и слобода во уредувањето.",
      "Резултатот е простор со сопствен архитектонски израз, кој ви остава доволно слобода да го внесете својот. Бидејќи вистинската вредност на едно решение се открива тогаш кога ќе стане дел од вашиот живот.",
    ],
  },
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

      {/* 2. Portfolio — the primary path into any project */}
      <section className="bg-chrome py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <ScrollReveal>
            <SectionHeading eyebrow="Портфолио" title="Нашите проекти" tone="dark" />
          </ScrollReveal>
        </div>
        <ScrollReveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-7xl px-5 sm:px-8 lg:px-10">
            <ProjectShowcase projects={projects} />
          </div>
        </ScrollReveal>
      </section>

      {/* 4. Why us — condensed trust, no repeated stats */}
      <section className="bg-cream py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <ScrollReveal>
            <SectionHeading eyebrow="Зошто нас" title="Изградени на искуство, не на кратенки." align="center" />
          </ScrollReveal>
          <div className="mt-12">
            <YearCounter founded={companyInfo.founded} />
          </div>
          <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
            {WHY_US.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.08}>
                <div className="border-t border-line pt-8">
                  <h3 className="t-h3">{item.title}</h3>
                  <div className="mt-5 max-w-[62ch] space-y-4 text-base leading-[1.75] text-ink/80">
                    {item.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

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
