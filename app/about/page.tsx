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
  description: `Јавор Шпед работи од ${companyInfo.founded} година и ја носи истата дисциплина во станбената градба: приказна, вредности и пат до City Center.`,
  path: "/about",
});

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

// The company in its own words. TODO(client): the first sentence names the company; confirm "Јавор Шпед" is the name to
// print there (the text was sent with a blank).
const ABOUT_TEXT = [
  "Нашата компанија Јавор Шпед е вашиот доверлив партнер во создавање на домови со највисок квалитет. Со долгогодишно искуство во изградба на станбени објекти во регионот, нашиот тим е посветен на исполнување на вашите соништа за идеален дом.",
  "Наша главна цел е да обезбедиме изградба на објекти кои не само што ги задоволуваат, туку и надминуваат очекувањата на нашите клиенти. Користиме само најквалитетни материјали, што ни овозможува да гарантираме долговечност и безбедност во секој наш проект.",
  "Со гордост ја истакнуваме нашата тимска работа. Нашиот инженерски тим е составен од врвни професионалци со десетици успешно завршени проекти зад себе. Ние веруваме во важноста на иновацијата и креативноста во секој аспект на изградбата, за да создадеме уникатни простори кои ќе одговараат на вашите потреби.",
  "Избирајќи не нас, избирате квалитет, доверба и професионализам. Вашиот дом не е само наш проект – тоа е наша голема одговорност.",
];

// Two things a buyer should know about how we build, in the company's own words.
const QUALITY_TEXT = [
  "Квалитетот на еден дом се препознава во вниманието со кое е создаден и во вредноста што ја задржува низ годините. Затоа, на секој наш проект му пристапуваме со одговорност и посветеност — од првичната замисла и изборот на материјали до прецизната изведба на секој детал.",
  "Со внимателно планирање и високи стандарди во изградбата, создаваме домови во кои естетиката, функционалноста и долготрајноста се надополнуваат. Зад секоја наша одлука стои јасна цел: да ви обезбедиме сигурен и удобен простор за живеење, во кој вие и вашето семејство ќе ја градите својата иднина со доверба.",
];

const COMFORT_TEXT = [
  "Добрата архитектура се чувствува во леснотијата со која го користите просторот. Во распоредот што ви одговара, во можноста да го уредите според својот вкус и во удобноста што останува подеднакво важна низ годините.",
  "Нашите станбени решенија произлегуваат од внимателно разгледување на различните потреби на современото живеење. Заедно со архитекти и дизајнери, ги усогласуваме пропорциите, намената и поврзаноста на просториите, за секој стан да понуди практичност, приватност и слобода во уредувањето.",
  "Резултатот е простор со сопствен архитектонски израз, кој ви остава доволно слобода да го внесете својот. Бидејќи вистинската вредност на едно решение се открива тогаш кога ќе стане дел од вашиот живот.",
];

const VISION_TEXT =
  "Нашата визија е да станеме лидер во создавање на современи и одржливи станбени решенија, кои ќе ги задоволат потребите на заедницата и ќе придонесат за подобрување на животната средина. Посветени сме на иновации и квалитет, со цел да обезбедиме уникатни домови кои ќе ги обединат луѓето и ќе создадат позитивна атмосфера за живеење.";

const VISION_AIMS = [
  "Да станеме синоним за квалитетна изградба и иновации во недвижности, создавајќи заедници кои се спој на удобност, стил и одржливост.",
  "Да ги водиме трендовите во архитектурата и изградбата, развивајќи уникатни проекти кои ќе инспирираат нови генерации да ја откриваат убавината на живеењето во нашиот простор.",
  "Да изградиме иднина во која секој дом е не само физички простор, туку и место за инспирација, безбедност и пријателство.",
];

const MISSION_TEXT = [
  "Нашата мисија е да ја оправдаме довербата на луѓето кои со нас го избираат својот дом. Тоа го остваруваме преку одговорна изградба, промислени архитектонски решенија и посветеност на квалитетот во секоја фаза од работата.",
  "Свесни за значењето што го има купувањето дом, кон секој проект пристапуваме со професионалност и со почит кон вложувањето и очекувањата на нашите купувачи. Создаваме станбени простори со трајна вредност, кои го унапредуваат секојдневното живеење и придонесуваат за развојот на заедницата.",
  "За нас, секој изграден дом е долгорочна одговорност — кон луѓето што ќе живеат во него и кон градот чиј дел станува.",
];

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

      <Story eyebrow="Приказна" statement={story.lead} gold={STORY_GOLD} more={[story.rest].filter(Boolean)} />

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
        <RevealHeading as="h2" className="bk-h2 bk-serif" duration={1.1} ease="power4.out" from={115}>
          Од 1994 до денес.
        </RevealHeading>
        <Timeline milestones={companyTimeline} />
      </section>

      <ClosingCta
        image={CLOSING_PHOTO}
        heading="„Вашиот дом е голема животна одлука. Нашата посветеност започнува токму тука.“"
        label="Закажи консултација"
        href="/contact"
      />
    </div>
  );
}
