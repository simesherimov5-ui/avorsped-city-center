import { Building2, Sparkles, Ruler, Landmark } from "lucide-react";
import { Hero } from "@/components/Hero";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { Media } from "@/components/ui/Media";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal as ScrollReveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { projects, companyInfo } from "@/data";

const WHY_US = [
  { icon: Building2, title: "Квалитетна градба", desc: "Строга контрола на квалитет во секоја фаза на градбата." },
  { icon: Sparkles, title: "Современа архитектура", desc: "Современ дизајн, никогаш типско решение." },
  { icon: Ruler, title: "Премиум материјали", desc: "Издржливи завршни работи со висока спецификација." },
  { icon: Landmark, title: "Внимание на деталите", desc: "Од пропорцијата на фасадата до изборот на арматура." },
];

const CTA_IMAGE = {
  src: "/images/exteriors/exterior-01-dusk.jpg",
  alt: "Јавор Шпед — вечерна визуелизација",
  isPlaceholder: false,
};

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
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.06}>
                <div className="flex flex-col gap-3.5 border-t border-line pt-6">
                  <item.icon className="h-5 w-5 text-gold-deep" strokeWidth={1.5} />
                  <div className="font-display text-xl">{item.title}</div>
                  <p className="text-sm leading-relaxed text-ink/60">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Final CTA — a clear, project-agnostic path to contact */}
      <section className="relative overflow-hidden bg-chrome py-28 text-center text-on-chrome sm:py-36">
        <div className="absolute inset-0">
          <ParallaxImage>
            <Media image={CTA_IMAGE} tone="dark" className="h-full w-full opacity-35" />
          </ParallaxImage>
          <div className="absolute inset-0 bg-chrome/70" />
        </div>
        <ScrollReveal>
          <div className="relative mx-auto max-w-xl px-5 sm:px-8 lg:px-10">
            <div className="eyebrow text-accent-soft">Следен чекор</div>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl">Закажи консултација</h2>
            <p className="mx-auto mt-5 max-w-md text-on-chrome/70">
              Разговарајте со нашиот тим за продажба за кој било од нашите проекти.
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
              <Button href="/consultation" variant="primary">
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
              <span className="hidden text-on-chrome/30 sm:inline" aria-hidden>
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
