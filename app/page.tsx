import { Building2, Sparkles, Ruler, Landmark } from "lucide-react";
import { Hero } from "@/components/Hero";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { Media } from "@/components/ui/Media";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { projects, companyInfo } from "@/data";

// Two images per project — the portfolio gallery represents every
// development equally rather than leaning on whichever has the most assets.
const GALLERY_PHOTOS = [
  { src: "/images/exteriors/exterior-03-day.jpg", alt: "City Center — фасада" },
  { src: "/images/stanbena-zgrada/facade-night.jpg", alt: "Станбена Куќа — фасада" },
  { src: "/images/dojran/facade.jpg", alt: "Дојрански Рај — фасада" },
  { src: "/images/exteriors/exterior-01-dusk.jpg", alt: "City Center — вечерна визуелизација" },
  { src: "/images/stanbena-zgrada/dvor.jpg", alt: "Станбена Куќа — двор" },
  { src: "/images/dojran/aerial-beach.jpg", alt: "Дојрански Рај — плажа Фук Так" },
];

const WHY_US = [
  { icon: Building2, title: "Квалитетна градба", desc: "Строга контрола на квалитет во секоја фаза на градбата." },
  { icon: Sparkles, title: "Современа архитектура", desc: "Современ дизајн, никогаш типско решение." },
  { icon: Ruler, title: "Премиум материјали", desc: "Издржливи завршни работи со висока спецификација." },
  { icon: Landmark, title: "Внимание на деталите", desc: "Од пропорцијата на фасадата до изборот на арматура." },
];

const CTA_IMAGE = { src: "/images/exteriors/exterior-01-dusk.jpg", alt: "Јавор Шпед — вечерна визуелизација", isPlaceholder: false };

export default function HomePage() {
  return (
    <>
      {/* 1. Hero — who we are */}
      <Hero />

      {/* 2. Visual quality across the portfolio */}
      <section className="bg-silver py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="Визуелизации"
              title="Архитектура со карактер"
              description="Од Струмица до Дојранското Езеро — секој проект носи ист стандард на дизајн и изработка."
              align="center"
            />
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="mt-10">
            <PhotoCarousel photos={GALLERY_PHOTOS} className="max-w-5xl" />
          </div>
        </Reveal>
      </section>

      {/* 3. Portfolio — the primary path into any project */}
      <section className="bg-charcoal py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Портфолио" title="Нашите проекти" tone="dark" />
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-7xl px-6 lg:px-10">
            <ProjectShowcase projects={projects} />
          </div>
        </Reveal>
      </section>

      {/* 4. Why us — condensed trust, no repeated stats */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Зошто нас" title="Изградени на искуство, не на кратенки." align="center" />
          </Reveal>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="flex flex-col gap-3.5 border-t border-line pt-6">
                  <item.icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                  <div className="font-display text-xl">{item.title}</div>
                  <p className="text-sm leading-relaxed text-ink/60">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Final CTA — a clear, project-agnostic path to contact */}
      <section className="relative overflow-hidden bg-charcoal py-28 text-center text-warm-white sm:py-36">
        <div className="absolute inset-0">
          <Media image={CTA_IMAGE} tone="dark" className="h-full w-full opacity-35" />
          <div className="absolute inset-0 bg-charcoal/70" />
        </div>
        <Reveal>
          <div className="relative mx-auto max-w-xl px-6">
            <div className="eyebrow text-accent-soft">Следен чекор</div>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl">Закажи консултација</h2>
            <p className="mx-auto mt-5 max-w-md text-warm-white/70">
              Разговарајте со нашиот тим за продажба за кој било од нашите проекти.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Button href="/consultation" variant="primary">Закажи консултација</Button>
              <Button href="/projects" variant="secondary" tone="dark">Погледни ги проектите</Button>
            </div>
            <div className="mt-8 text-sm text-warm-white/50">
              {companyInfo.phone} · {companyInfo.email}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
