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

/** "Што нè разликува": the heading in the first four columns, the four short texts in a 2 × 2 grid in columns 6 to 12. */
export function Differences() {
  return (
    <section className="section-y bg-cream text-charcoal">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-x-8">
        <Reveal className="lg:col-span-4">
          <div className="eyebrow text-gold-deep">Што нè разликува</div>
          <h2 className="t-h2 mt-3">
            Деталите
            <br />
            <em className="italic text-gold-deep">се сè.</em>
          </h2>
        </Reveal>
        <div className="grid auto-rows-fr gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
          {ITEMS.map((item, i) => (
            <Reveal key={item.lead} delay={i * 0.08} className="h-full">
              <div className="flex h-full flex-col gap-3 border-t border-line pt-6">
                <div className="eyebrow text-gold-deep">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="t-h3">
                  {item.lead}
                  <br />
                  <em className="italic text-gold-deep">{item.accent}</em>
                </h3>
                <p className="max-w-[65ch] text-[15px] leading-[1.7] text-ink/75">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
