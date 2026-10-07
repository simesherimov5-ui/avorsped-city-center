import { Reveal } from "@/components/motion/Reveal";

const ITEMS = [
  {
    lead: "Квалитет",
    accent: "што трае",
    text: "Секој материјал го избираме со посветеност и внимание. Квалитетот се чувствува.",
  },
  {
    lead: "Локации",
    accent: "што имаат смисла",
    text: "Градиме секогаш блиску до сè што е важно за секојдневниот живот.",
  },
  {
    lead: "Грижа",
    accent: "за секој детал",
    text: "Врвни инженери и наша механизација ја следат градбата од темелот до клучот.",
  },
  {
    lead: "Секој проект,",
    accent: "чекор понапред",
    text: "Со секој нов проект учиме, иновираме и доаѓаме до понапредни решенија. Затоа следната зграда е секогаш подобра од претходната.",
  },
];

/** "Што нè разликува": four short texts on a light surface, numbered because they are a list of four. */
export function Differences() {
  return (
    <section className="bg-cream text-charcoal">
      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:flex-row lg:gap-16 lg:px-10">
        <Reveal>
          <div className="lg:w-[340px] lg:shrink-0">
            <div className="eyebrow text-gold-deep">Што нè разликува</div>
            <h2 className="mt-5 font-display text-[clamp(34px,4.2vw,60px)] font-normal leading-[1.04]">
              Деталите
              <br />
              <em className="italic text-gold-deep">се сè.</em>
            </h2>
          </div>
        </Reveal>
        <div className="grid min-w-0 flex-1 gap-x-10 sm:grid-cols-2">
          {ITEMS.map((item, i) => (
            <Reveal key={item.lead} delay={i * 0.06}>
              <div className="flex flex-col gap-3.5 border-t border-line py-7">
                <div className="eyebrow text-gold-deep">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="font-display text-[26px] font-normal leading-[1.15] sm:text-[30px]">
                  {item.lead}
                  <br />
                  <em className="italic text-gold-deep">{item.accent}</em>
                </h3>
                <p className="text-sm font-light leading-[1.7] text-ink/75">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
