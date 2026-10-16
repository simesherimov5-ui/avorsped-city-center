import type { Metadata } from "next";
import { companyInfo, companyStats, companyTimeline } from "@/data";
import { AboutHero, type HeroStat } from "@/components/about/AboutHero";
import { ReadingProgress } from "@/components/about/ReadingProgress";
import { Story } from "@/components/about/Story";
import { Values } from "@/components/about/Values";
import { Timeline } from "@/components/about/Timeline";
import { ClosingCta } from "@/components/about/ClosingCta";
import { Prose } from "@/components/about/Prose";
import { PullQuote } from "@/components/ui/PullQuote";
import { RevealHeading } from "@/components/motion/RevealHeading";
import "@/components/black/black.css";
import "@/components/about/about.css";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "За нас",
  description: `Јавор Шпед работи од ${companyInfo.founded} година и ја носи истата дисциплина во станбената градба: приказна, вредности и пат до проектите.`,
  path: "/about",
});

// Photography: existing project renders. TODO(client): the hero photo (or a short silent video), the values
// photos (one per value is supported) and the closing photo.
const HERO_PHOTO = { src: "/images/exteriors/exterior-01-dusk.jpg", alt: "City Center во самрак — визуелизација" };
const VALUES_PHOTOS = [{ src: "/images/exteriors/exterior-02-facade.jpg", alt: "Детаљ од фасадата на City Center" }];
const CLOSING_PHOTO = { src: "/images/exteriors/exterior-03-day.jpg", alt: "City Center — визуелизација" };

// The larger sentence that opens the story; the company's own story follows it.
const STORY_INTRO = "Од 1994 градиме домови во кои луѓето остануваат да живеат. Без кратенки, од темелот до клучот.";

// The company in its own words, two to three sentences a paragraph.
const ABOUT_TEXT = [
  "Јавор Шпед гради станбени објекти во регионот повеќе од три децении. Нашиот тим ја води секоја зграда од првата скица до предавањето на клучот.",
  "Избираме материјали што траат и ја следиме градбата со сопствени инженери и механизација.",
];

// Two things a buyer should know about how we build, in the company's own words.
const QUALITY_TEXT = [
  "Квалитетот на еден дом се препознава во вниманието со кое е создаден и во вредноста што ја задржува низ годините. Затоа секој проект го водиме со одговорност, од првата замисла и изборот на материјали до изведбата на секој детал.",
  "Со внимателно планирање и високи стандарди градиме домови во кои естетиката, функционалноста и долготрајноста одат заедно. Целта е сигурен и удобен простор во кој вие и вашето семејство ќе ја градите својата иднина.",
];

const COMFORT_TEXT = [
  "Добрата архитектура се чувствува во леснотијата со која го користите просторот: во распоредот, во слободата да го уредите по свој вкус и во удобноста што трае.",
  "Нашите решенија тргнуваат од потребите на современото живеење. Заедно со архитекти и дизајнери ги усогласуваме пропорциите, намената и поврзаноста на просториите, за секој стан да понуди практичност, приватност и слобода во уредувањето.",
  "Резултатот е простор со сопствен архитектонски израз, кој ви остава доволно место и за вашиот.",
];

const VISION_TEXT =
  "Нашата визија е да станеме лидер во современи и одржливи станбени решенија, што им служат на заедницата и на животната средина. Преку иновации и квалитет градиме уникатни домови што ги поврзуваат луѓето.";

const VISION_AIMS = [
  "Да станеме синоним за квалитетна изградба и иновации во недвижности, создавајќи заедници кои се спој на удобност, стил и одржливост.",
  "Да ги водиме трендовите во архитектурата и изградбата, развивајќи уникатни проекти кои ќе инспирираат нови генерации да ја откриваат убавината на живеењето во нашиот простор.",
  "Да изградиме иднина во која секој дом е не само физички простор, туку и место за инспирација, безбедност и пријателство.",
];

const MISSION_TEXT = [
  "Нашата мисија е да ја оправдаме довербата на луѓето кои со нас го избираат својот дом. Тоа го правиме со одговорна изградба, промислени архитектонски решенија и грижа за квалитетот во секоја фаза.",
  "Знаеме колку значи купувањето дом, затоа го почитуваме вложувањето и очекувањата на секој купувач. Градиме простори со трајна вредност, за подобро секојдневие и за развој на заедницата.",
  "За нас, секој изграден дом е долгорочна одговорност — кон луѓето што ќе живеат во него и кон градот чиј дел станува.",
];

const stat = (label: string) => companyStats.find((s) => s.label === label);

export default function AboutPage() {
  const built = stat("Изградени станови");
  const building = stat("Згради во изградба");
  const heroStats: HeroStat[] = [
    { lead: "Од", value: String(companyInfo.founded) },
    ...(built ? [{ value: built.value, label: built.label }] : []),
    ...(building ? [{ value: building.value, label: building.label }] : []),
  ];

  return (
    <div data-theme="black" className="bk-page grain grain--dark">
      <ReadingProgress />

      <AboutHero
        image={HERO_PHOTO}
        eyebrow="За нас"
        lines={["Градиме трпеливо.", "Градиме за долго."]}
        stats={heroStats}
      />

      <Story eyebrow="Приказна" statement={STORY_INTRO} more={[companyInfo.story]} />

      <section className="bk-wrap bk-section">
        <Prose heading="За нас" paragraphs={ABOUT_TEXT} />
      </section>

      <section className="bk-wrap bk-section">
        <Prose heading="Квалитетна изградба" paragraphs={QUALITY_TEXT} />
      </section>

      <section className="bk-wrap bk-section">
        <Prose heading="Уникатни решенија и удобност" paragraphs={COMFORT_TEXT} />
      </section>

      <section className="bk-wrap bk-section">
        <Values
          eyebrow="За што се залагаме"
          heading="Четири вредности."
          values={companyInfo.values}
          images={VALUES_PHOTOS}
        />
      </section>

      {/* Two lines the company stands behind. TODO(client): a real quote with name and role could replace this one. */}
      <section className="bk-wrap bk-section">
        <PullQuote tone="dark">„Делата зборуваат за нас. Довербата нè води понатаму.“</PullQuote>
      </section>

      <section className="bk-wrap bk-section">
        <Prose heading="Визија" paragraphs={[VISION_TEXT]}>
          <ul className="ab-aims">
            {VISION_AIMS.map((aim) => (
              <li key={aim.slice(0, 24)}>{aim}</li>
            ))}
          </ul>
        </Prose>
      </section>

      <section className="bk-wrap bk-section">
        <Prose heading="Нашата мисија" paragraphs={MISSION_TEXT} />
      </section>

      <section className="bk-wrap bk-section">
        <div className="bk-eyebrow">Нашиот пат</div>
        <RevealHeading as="h2" className="bk-h2 bk-serif" from={115}>
          Од 1994 до денес.
        </RevealHeading>
        <Timeline milestones={companyTimeline} />
      </section>

      <ClosingCta
        image={CLOSING_PHOTO}
        heading="Вашиот дом е голема животна одлука."
        label="Закажи консултација"
        href="/contact"
      />
    </div>
  );
}
