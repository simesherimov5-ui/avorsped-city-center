import Link from "next/link";
import { Building2, ShieldCheck, Sparkles, Landmark, Ruler, MapPin, ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { ProjectCard } from "@/components/ProjectCard";
import { StatusLegend } from "@/components/ui/StatusBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";
import { Button } from "@/components/ui/Button";
import { projects, companyStats } from "@/data";

const HIGHLIGHTS = [
  {
    title: "30 години искуство",
    quote: "Секој проект го градиме со истата посветеност како да е нашиот прв.",
    href: "/about",
  },
  {
    title: "Квалитет",
    quote: "Не прифаќаме кратенки — секој детал поминува низ строга контрола пред да биде завршен.",
    href: "/development",
  },
  {
    title: "Доверба",
    quote: "Транспарентен процес на продажба, од првиот разговор до предавањето на клучевите.",
    href: "/contact",
  },
];

const GALLERY_PHOTOS = [
  { src: "/images/exteriors/exterior-03-day.jpg", alt: "City Center — фасада" },
  { src: "/images/exteriors/exterior-01-dusk.jpg", alt: "City Center — вечерна визуелизација" },
  { src: "/images/exteriors/exterior-gallery-1.jpg", alt: "City Center — комплекс" },
  { src: "/images/site/masterplan-aerial.jpg", alt: "City Center — ситуационен план" },
];

const WHY_US = [
  { icon: ShieldCheck, title: "30 години искуство", desc: "Секој завршен проект е испорачан во ветениот рок." },
  { icon: Building2, title: "Квалитетна градба", desc: "Строга контрола на квалитет во секоја фаза на градбата." },
  { icon: Sparkles, title: "Современа архитектура", desc: "Современ дизајн, никогаш типско решение." },
  { icon: Ruler, title: "Премиум материјали", desc: "Издржливи завршни работи со висока спецификација." },
  { icon: MapPin, title: "Стратешки локации", desc: "Локации избрани поради транспорт, училишта и пристап до градот." },
  { icon: Landmark, title: "Внимание на деталите", desc: "Од пропорцијата на фасадата до изборот на арматура." },
];

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <Hero />

      {/* 2. Highlights — three short quotes */}
      <section className="bg-warm-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 sm:grid-cols-3 sm:divide-x sm:divide-line">
            {HIGHLIGHTS.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="sm:px-8 sm:first:pl-0 sm:last:pr-0">
                  <h3 className="inline-block border-b-4 border-accent pb-1 font-display text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-ink/60">{item.quote}</p>
                  <Link
                    href={item.href}
                    aria-label={item.title}
                    className="focus-ring mt-6 flex h-9 w-9 items-center justify-center rounded-full border-2 border-accent text-accent transition-colors hover:bg-accent hover:text-charcoal"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Project photos */}
      <section className="bg-silver py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="Визуелизации"
              title="Визуелизација"
              description="Погледнете го домот пред да го изградиме — секој агол, секоја линија, секој детал."
            />
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="mt-10">
            <PhotoCarousel photos={GALLERY_PHOTOS} />
          </div>
        </Reveal>
      </section>

      {/* 4. Portfolio — clickable projects */}
      <section className="bg-warm-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Нашето портфолио" title="Портфолио на проекти" />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why us + final CTA */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Зошто нас" title="Изградени на искуство, не на кратенки." align="center" />
          </Reveal>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="flex flex-col gap-3 border-t border-line pt-5">
                  <item.icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                  <div className="font-display text-lg">{item.title}</div>
                  <p className="text-sm text-ink/60">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div className="mt-14 grid grid-cols-2 gap-6 border-t border-line pt-10 sm:grid-cols-4">
              {companyStats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl text-accent">
                    <CountUp value={stat.value} />
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-ink/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-charcoal py-28 text-center text-warm-white">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-display text-3xl sm:text-4xl">Пронајди го твојот нов дом</h2>
          <div className="mt-6 flex justify-center">
            <StatusLegend className="text-warm-white/70 [&_span]:text-warm-white/70" />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/apartments" variant="primary">Разгледај станови</Button>
            <Button href="/consultation" variant="secondary" tone="dark">Закажи консултација</Button>
          </div>
        </div>
      </section>
    </>
  );
}
