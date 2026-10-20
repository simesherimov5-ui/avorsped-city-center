import { Reveal } from "@/components/motion/Reveal";
import { DifferencesStage, type DifferenceItem } from "@/components/home/DifferencesStage";

const ITEMS: DifferenceItem[] = [
  {
    title: "Квалитет што трае",
    text: "Секој материјал го избираме внимателно. Квалитетот се чувствува.",
    photo: { src: "/images/exteriors/exterior-02-facade.jpg", x: 42 },
  },
  {
    title: "Локации блиску до сè",
    text: "Градиме блиску до сè што ви треба секој ден.",
    photo: { src: "/images/site/courtyard.jpg", x: 50 },
  },
  {
    title: "Грижа за секој детал",
    text: "Наши инженери и наша механизација, од темелот до клучот.",
    photo: { src: "/images/stanbena-zgrada/dvor.jpg", x: 55 },
  },
  {
    title: "Секој проект, чекор понапред",
    text: "Со секој проект учиме. Затоа секоја следна зграда е подобра.",
    photo: { src: "/images/exteriors/exterior-05-object5.jpg", x: 30 },
  },
];

/**
 * "Што нè разликува": four short texts on a light surface, numbered because they are a list of four. From 900px a photo
 * stays in place beside them and follows the point in the middle of the screen (DifferencesStage); under 900px every
 * point has its own photo.
 */
export function Differences() {
  return (
    <section className="grain bg-cream text-charcoal">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-[70px] sm:px-8 sm:pb-24 lg:px-10">
        <Reveal>
          <div>
            <div className="eyebrow text-gold-deep">Што нè разликува</div>
            <h2 className="mt-4 font-display text-(length:--fs-h2) font-normal leading-[1.2]">
              Деталите
              <br />
              се сè.
            </h2>
          </div>
        </Reveal>
        <div className="mt-12">
          <DifferencesStage items={ITEMS} />
        </div>
      </div>
    </section>
  );
}
