import { Reveal } from "@/components/motion/Reveal";

const ITEMS = [
  { title: "Квалитет што трае", text: "Секој материјал го избираме внимателно. Квалитетот се чувствува." },
  { title: "Локации блиску до сè", text: "Градиме блиску до сè што ви треба секој ден." },
  { title: "Грижа за секој детал", text: "Наши инженери и наша механизација, од темелот до клучот." },
  { title: "Секој проект, чекор понапред", text: "Со секој проект учиме. Затоа секоја следна зграда е подобра." },
];

/** "Што нè разликува": four short texts on a light surface, numbered because they are a list of four. */
export function Differences() {
  return (
    <section className="grain bg-cream text-charcoal">
      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-5 pb-16 pt-[70px] sm:px-8 sm:pb-24 lg:flex-row lg:gap-14 lg:px-10">
        <Reveal>
          <div className="lg:w-[300px] lg:shrink-0">
            <div className="eyebrow text-gold-deep">Што нè разликува</div>
            <h2 className="mt-4 font-display text-(length:--fs-h2) font-normal leading-[1.2]">
              Деталите
              <br />
              се сè.
            </h2>
          </div>
        </Reveal>
        <div className="grid min-w-0 flex-1 gap-x-10 sm:grid-cols-2">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <div className="flex flex-col gap-3 border-t border-line py-6">
                <div className="eyebrow text-gold-deep">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="font-display text-(length:--fs-h3) font-normal leading-[1.3]">{item.title}</h3>
                <p className="text-[14px] font-normal leading-[1.7] text-ink/75">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
