import type { Metadata } from "next";
import { companyInfo, companyStats, companyTimeline } from "@/data";
import { COMPANIES, THIS_COMPANY } from "@/components/company-ticker/companies";
import { AboutHero, type HeroStat } from "@/components/about/AboutHero";
import { ReadingProgress } from "@/components/about/ReadingProgress";
import { Story } from "@/components/about/Story";
import { Values } from "@/components/about/Values";
import { Timeline } from "@/components/about/Timeline";
import { Companies } from "@/components/about/Companies";
import { ClosingCta } from "@/components/about/ClosingCta";
import { RevealHeading } from "@/components/motion/RevealHeading";
import "@/components/black/black.css";
import "@/components/about/about.css";

export const metadata: Metadata = {
  title: "За нас",
  description:
    "Дознајте повеќе за Јавор Шпед и Exclusive Building — нашата приказна, мисија, вредности и завршени проекти.",
};

// Photography: existing project renders. TODO(client): the hero photo (or a short silent video), the values
// photos (one per value is supported) and the closing photo.
const HERO_PHOTO = { src: "/images/exteriors/exterior-01-dusk.jpg", alt: "City Center во самрак — визуелизација" };
const VALUES_PHOTOS = [{ src: "/images/exteriors/exterior-02-facade.jpg", alt: "Детаљ од фасадата на City Center" }];
const CLOSING_PHOTO = { src: "/images/exteriors/exterior-03-day.jpg", alt: "City Center — визуелизација" };

// The words of the story set in gold italic. TODO(client): confirm which words.
const STORY_GOLD = "диверзифицирана холдинг група";

/** First sentence of the story, and the rest of it. */
function splitStory(text: string) {
  const end = text.search(/\.\s+(?=\p{Lu})/u);
  return end < 0 ? { lead: text, rest: "" } : { lead: text.slice(0, end + 1), rest: text.slice(end + 1).trim() };
}

const stat = (label: string) => companyStats.find((s) => s.label === label);

export default function AboutPage() {
  const story = splitStory(companyInfo.story);
  const built = stat("Изградени станови");
  const building = stat("Згради во изградба");
  const heroStats: HeroStat[] = [
    { lead: "Од", value: String(companyInfo.founded) },
    ...(built ? [{ value: built.value, label: built.label }] : []),
    ...(building ? [{ value: building.value, label: building.label }] : []),
  ];

  return (
    <div data-theme="black" className="bk-page">
      <ReadingProgress />

      <AboutHero
        image={HERO_PHOTO}
        eyebrow="За нас"
        lines={["Градиме трпеливо.", "Градиме за долго."]}
        stats={heroStats}
      />

      <Story
        eyebrow="Приказна"
        statement={story.lead}
        gold={STORY_GOLD}
        more={[story.rest, companyInfo.mission].filter(Boolean)}
      />

      <section className="bk-px bk-section">
        <Values
          eyebrow="За што се залагаме"
          heading="Четири вредности."
          values={companyInfo.values}
          images={VALUES_PHOTOS}
        />
      </section>

      {/* TODO(client): a real quote with name and role. Until one is given the quote band is left out. */}

      <section className="bk-px bk-section">
        <div className="bk-eyebrow">Нашиот пат</div>
        <RevealHeading as="h2" className="bk-h2 bk-serif" duration={1.1} ease="power4.out" from={115}>
          Од 1994 до денес.
        </RevealHeading>
        <Timeline milestones={companyTimeline} />
      </section>

      <section className="bk-px bk-section">
        <Companies
          eyebrow="Дел од Јавор Шпед"
          companies={[THIS_COMPANY, ...COMPANIES.filter((c) => c !== THIS_COMPANY)]}
        />
      </section>

      <ClosingCta
        image={CLOSING_PHOTO}
        heading="Дојдете да ги видите становите одблизу."
        label="Закажи консултација"
        href="/contact"
      />
    </div>
  );
}
