import { Reveal } from "@/components/motion/Reveal";
import { DifferencesStage, type DifferenceItem } from "@/components/home/DifferencesStage";

const ITEMS: DifferenceItem[] = [
  {
    title: "Квалитет што трае",
    text: "Темните рамки на прозорците и топлите тонови на облогите се внимателно усогласени.",
    photo: {
      src: "/images/home-differences/01-city-center-facade.png",
      alt: "Фасада со темни рамки на прозорците и топли облоги",
      x: 40,
      y: 50,
    },
  },
  {
    title: "Јасни архитектонски линии",
    text: "Длабоките балкони ѝ даваат ритам на фасадата и сенка на терасите.",
    photo: {
      src: "/images/home-differences/03-radovish-twins-daylight.png",
      alt: "Станбена зграда со длабоки балкони и ритмична фасада на дневна светлина",
      x: 62,
      y: 50,
    },
  },
  {
    title: "Грижа за секој детал",
    text: "Од влезот до балконите, линиите и материјалите се надоврзуваат.",
    photo: {
      src: "/images/home-differences/03-facade-street-original.jpeg",
      alt: "Висока станбена зграда со влез под настрешница и вертикални линии на фасадата",
      x: 22,
      y: 60,
    },
  },
  {
    title: "Удобност со мера",
    text: "Мекото осветлување ги нагласува текстурите и му дава мирен тон на ентериерот.",
    photo: {
      src: "/images/home-differences/04-dojranski-raj-interior.jpg",
      alt: "Дневна соба со мека светлина, дрвени панели и голем прозорец кон пејзаж",
      x: 50,
      y: 60,
    },
  },
];

/**
 * "Што нè разликува": four short texts on a light surface, numbered because they are a list of four. From 1024px the
 * heading (one line) and a photo stay in place beside them, the photo following the point beside it (DifferencesStage);
 * under 1024px the heading is on two lines and every point has its own photo.
 */
export function Differences() {
  return (
    <section className="grain bg-cream text-charcoal">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-[70px] sm:px-8 sm:pb-24 lg:px-10">
        <DifferencesStage
          heading={
            <Reveal>
              <div>
                <div className="eyebrow text-gold-deep">Што нè разликува</div>
                <h2 className="mt-4 font-display text-(length:--fs-h2) font-normal leading-[1.2]">
                  Деталите <br className="lg:hidden" />
                  се сè.
                </h2>
              </div>
            </Reveal>
          }
          items={ITEMS}
        />
      </div>
    </section>
  );
}
