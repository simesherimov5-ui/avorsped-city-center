import { buildSampleApartments, generateDevelopment, type SampleUnit } from "./generate";
import { dojranFloors } from "./dojran";
import type { Apartment, Building, CompanyMilestone, CompanyStat, Project } from "@/types";

const generated = generateDevelopment();

/** City Center's own development (its masterplan, buildings and text): only City Center's pages read this. */
export const development = generated.development;
/** City Center's buildings. Other projects' buildings are in `projects[n].buildings`; read them through `projectsOnSale()`. */
export const buildings: Building[] = generated.development.buildings;

export function availabilityCounts(list: Apartment[] = apartments) {
  return {
    available: list.filter((a) => a.status === "available").length,
    reserved: list.filter((a) => a.status === "reserved").length,
    sold: list.filter((a) => a.status === "sold").length,
    total: list.length,
  };
}

export { residentQuotes } from "./quotes";

export const projects: Project[] = [
  {
    id: "city-center",
    slug: "city-center",
    name: "City Center",
    location: "Ул. Ленинова, Струмица, Северна Македонија",
    city: "Струмица",
    status: "under-construction",
    year: 2027,
    units: development.totalApartments,
    description: development.description,
    tagline: "Најдобрата локација за вашиот нов дом",
    heroOpening: true,
    // TODO(client): the drone film (docs/content-needed.md). Drop the file in public/ and set `heroVideo: "/videos/<file>.mp4"`.
    openingTagline: "Шест згради, една нова адреса за центарот на Струмица.",
    about: {
      kicker: "ЗА ПРОЕКТОТ",
      title: "Нов стандард на живеење, ",
      titleItalic: "во срцето на Струмица.",
      paragraphs: [
        "[Неколку реченици за идејата на комплексот: што го прави посебен, како е поставен во центарот на Струмица, светлина, зеленило и простор меѓу зградите. Текстот ќе го напишеме заедно во документот.]",
        "[Втор пасус: за кого е наменет и каков живот нуди.]",
      ],
      signature: "Javor Sped Holding",
      en: {
        kicker: "ABOUT THE PROJECT",
        title: "A new standard of living, ",
        titleItalic: "in the heart of Strumica.",
      },
    },
    // TODO(client): the north direction on the aerial photo, in degrees (docs/content-needed.md).
    masterplanNorth: 0,
    // TODO(client): the material photos, makers and the headings (docs/content-needed.md).
    materialsHeading: { title: "[Наслов за квалитетот] ", titleItalic: "[продолжение]" },
    equippedBy: "Luxury Home",
    materials: ["Гранит", "Плочки", "Санитарија", "Подови"].map((name) => ({
      name,
      note: "[Каде се користи · производител]",
    })),
    parking: {
      title: "[Наслов за паркингот] ",
      titleItalic: "[продолжение]",
      text: "[Подземна гаража и паркинг места во комплексот: како се влегува, дали има лифт од гаража до станот, гаражни места за продажба.]",
    },
    // TODO(client): the real places and minutes on foot.
    walking: {
      title: "Центарот на Струмица, ",
      titleItalic: "на неколку чекори.",
      places: [
        { name: "[Плоштад]", time: "[ 3 МИН ПЕШКИ ]" },
        { name: "[Училиште]", time: "[ 5 МИН ]" },
        { name: "[Градинка]", time: "[ 5 МИН ]" },
        { name: "[Маркет]", time: "[ 2 МИН ]" },
        { name: "[Парк]", time: "[ 6 МИН ]" },
      ],
    },
    // TODO(client): the date of the last update, the month of each phase and the construction photos.
    progress: { title: "Следете како ", titleItalic: "расте." },
    book: {
      title: "[Наслов за покана] ",
      titleItalic: "[продолжение]",
      text: "[Кратка реченица: средба во канцеларија или прошетка низ градилиштето.]",
    },
    distanceHighlights: ["250 м од градски парк", "500 м од центарот на градот"],
    // A narrow frame (the Проекти card) is centred on the main central building, so it is whole from roof to ground.
    imageFocus: { zoom: 1, x: 52, y: 50 },
    heroImage: { src: "/images/exteriors/exterior-hero-wide.jpg", alt: "City Center", isPlaceholder: false },
    gallery: [
      { src: "/images/exteriors/exterior-gallery-1.jpg", alt: "City Center — визуелизација 1", isPlaceholder: false },
      { src: "/images/exteriors/exterior-gallery-2.jpg", alt: "City Center — визуелизација 2", isPlaceholder: false },
      { src: "/images/site/masterplan-aerial.jpg", alt: "City Center — ситуационен план", isPlaceholder: false },
    ],
    specifications: [
      { label: "Згради", value: "6" },
      { label: "Вкупно станови", value: String(development.totalApartments) },
      { label: "Очекуван завршеток", value: development.expectedCompletion },
      { label: "Локација", value: development.location },
    ],
    href: "/development",
    constructionStages: development.constructionStages,
    // Derived from the stage data above: foundations are done and the structure is at 90%.
    // TODO(client): confirm the real phase and percentage, and add "updated" (YYYY-MM-DD) to show a date.
    construction: { currentPhase: "structure", percent: 90, handover: development.expectedCompletion },
    buildings: development.buildings,
    capabilities: { hasMasterplan: true, hasBuildings: true, hasApartmentSelection: true },
  },
  {
    id: "stanbena-kukja",
    slug: "stanbena-kukja",
    name: "Станбена Куќа",
    location: "Ул. Цветан Димов бр. 16, Струмица, Северна Македонија",
    city: "Струмица",
    status: "upcoming",
    year: 2028,
    units: 7,
    description:
      "Објект проектиран по најсовремени стандарди и нормативи, со функционални станови и високо ниво на технологија. Лоциран во мирен дел на градот, во близина на градскиот парк, училишта, болници, супермаркети и спортски сали.",
    // The hero photo is square (1730 × 1787): in a wide frame Media shows it whole, over a blurred copy of itself.
    imageFocus: { zoom: 1, x: 50, y: 50, aspect: 1730 / 1787 },
    heroImage: { src: "/images/stanbena-zgrada/facade-night.jpg", alt: "Станбена Куќа — фасада", isPlaceholder: false },
    gallery: [
      { src: "/images/stanbena-zgrada/facade-night.jpg", alt: "Станбена Куќа — фасада", isPlaceholder: false },
      { src: "/images/stanbena-zgrada/dnevna-soba.jpg", alt: "Станбена Куќа — дневен престој", isPlaceholder: false },
      { src: "/images/stanbena-zgrada/kujna.jpg", alt: "Станбена Куќа — кујна и трпезарија", isPlaceholder: false },
      { src: "/images/stanbena-zgrada/dvor.jpg", alt: "Станбена Куќа — двор", isPlaceholder: false },
    ],
    roomTour: [
      {
        label: "Дневна соба",
        image: { src: "/images/stanbena-zgrada/dnevna-soba.jpg", alt: "Дневна соба", isPlaceholder: false },
        video: "/videos/stanbena-zgrada/dnevna-soba.mp4",
      },
      {
        label: "Кујна и трпезарија",
        image: { src: "/images/stanbena-zgrada/kujna.jpg", alt: "Кујна и трпезарија", isPlaceholder: false },
        video: "/videos/stanbena-zgrada/kujna.mp4",
      },
      {
        label: "Двор",
        image: { src: "/images/stanbena-zgrada/dvor.jpg", alt: "Двор", isPlaceholder: false },
        video: "/videos/stanbena-zgrada/dvor.mp4",
      },
    ],
    floorPlanExplorer: {
      image: {
        src: "/images/stanbena-zgrada/floorplan-numbered.webp",
        alt: "Распоред на просториите — четирисобен стан",
        isPlaceholder: false,
      },
      rooms: {
        "dnevna-soba": {
          label: "Дневна соба",
          video: "/videos/stanbena-zgrada/dnevna-soba.mp4",
          poster: "/images/stanbena-zgrada/dnevna-soba.jpg",
        },
        kujna: {
          label: "Кујна и трпезарија",
          video: "/videos/stanbena-zgrada/kujna.mp4",
          poster: "/images/stanbena-zgrada/kujna.jpg",
        },
        dvor: { label: "Двор", video: "/videos/stanbena-zgrada/dvor.mp4", poster: "/images/stanbena-zgrada/dvor.jpg" },
      },
      // Numbered badges on the floor-plan image, matched by eye to the render.
      // Only numbers with a linked room are clickable; the rest are shown as-is.
      hotspots: [
        { number: 1, top: "34.0%", left: "31.8%" },
        { number: 2, top: "44.2%", left: "70.3%", room: "dnevna-soba" },
        { number: 3, top: "22.2%", left: "76.0%", room: "kujna" },
        { number: 4, top: "60.7%", left: "21.2%" },
        { number: 5, top: "71.5%", left: "47.8%" },
        { number: 6, top: "39.8%", left: "15.4%" },
        { number: 7, top: "27.8%", left: "55.6%", room: "kujna" },
        { number: 8, top: "87.5%", left: "77.1%", room: "dvor" },
        { number: 9, top: "95.1%", left: "12.4%" },
      ],
    },
    floors: [
      { number: 0, label: "Приземје" },
      { number: 1, label: "Кат 1" },
      { number: 2, label: "Кат 2" },
      { number: 3, label: "Кат 3" },
    ],
    apartmentTypes: [
      {
        label: "Четирисобен — Стан 1 / Приземје",
        area: "115 м² + 50 м² двор",
        image: {
          src: "/images/stanbena-zgrada/floorplans/stan-1-prizemje.jpg",
          alt: "Распоред — Стан 1, Приземје, четирисобен",
          isPlaceholder: false,
        },
      },
      {
        label: "Трособен — Стан 2, 4, 6 / Кат 1, 2, 3",
        area: "87 м²",
        image: {
          src: "/images/stanbena-zgrada/floorplans/stan-2-4-6-kat.jpg",
          alt: "Распоред — Стан 2, 4, 6, трособен",
          isPlaceholder: false,
        },
      },
      {
        label: "Трособен — Стан 3, 5, 7 / Кат 1, 2, 3",
        area: "83 м²",
        image: {
          src: "/images/stanbena-zgrada/floorplans/stan-3-5-7-kat.jpg",
          alt: "Распоред — Стан 3, 5, 7, трособен",
          isPlaceholder: false,
        },
      },
    ],
    specifications: [
      { label: "Локација", value: "Ул. Цветан Димов бр. 16, Струмица" },
      { label: "Вкупно станови", value: "7" },
      { label: "Тип станови", value: "Четирисобен (приземје), трособни (кат 1-3)" },
      { label: "Ориентација", value: "Североисток / Југозапад" },
    ],
    capabilities: { hasMasterplan: false, hasBuildings: false, hasApartmentSelection: false },
  },
  {
    id: "dojranski-raj",
    slug: "dojranski-raj",
    name: "Дојрански Рај",
    location: "Стар Дојран — Сретеново, Северна Македонија",
    city: "Дојран",
    status: "under-construction",
    year: 2027,
    units: 30,
    description:
      "Гарсоњери од 27 до 41 м² на чекор од Дојранското Езеро, во Сретеново, Стар Дојран (плажа Фук Так). Природа, сонце, чист воздух и медитеранска клима — совршена локација за одмор и живот без грижа.",
    tagline: "Дојран како никогаш досега",
    distanceHighlights: ["На плажа Фук Так", "Чекор до Дојранското Езеро"],
    href: "/dojran",
    // The frames are wider than the photos (the slider is about 3.6:1, the photos 2:1), so a plain cover crop cut
    // off the roof. Show it a little further out; the edges are filled with a blurred copy of the photo.
    imageFocus: { zoom: 0.87, x: 50, y: 46, aspect: 2 },
    heroImage: { src: "/images/dojran/facade.jpg", alt: "Дојрански Рај — фасада", isPlaceholder: false },
    gallery: [
      { src: "/images/dojran/facade.jpg", alt: "Дојрански Рај — фасада", isPlaceholder: false },
      { src: "/images/dojran/facade-2.jpg", alt: "Дојрански Рај — фасада 2", isPlaceholder: false },
      { src: "/images/dojran/facade-3.jpg", alt: "Дојрански Рај — фасада 3", isPlaceholder: false },
      { src: "/images/dojran/facade-4.jpg", alt: "Дојрански Рај — фасада 4", isPlaceholder: false },
      { src: "/images/dojran/aerial-1.jpg", alt: "Дојрански Рај — аерален поглед", isPlaceholder: false },
      { src: "/images/dojran/aerial-beach.jpg", alt: "Дојрански Рај — плажа Фук Так", isPlaceholder: false },
    ],
    specifications: [
      { label: "Локација", value: "Стар Дојран, Сретеново (плажа Фук Так)" },
      { label: "Површини", value: "27 до 41 м²" },
      { label: "Вселување", value: "Јули 2027" },
      { label: "Контакт", value: "071/333-088" },
    ],
    capabilities: { hasMasterplan: false, hasBuildings: false, hasApartmentSelection: false },
  },
  {
    id: "gtc-global",
    slug: "gtc-global",
    name: "ГТЦ Глобал",
    location: "ул. „Ленинова“ бр. 44, Струмица",
    city: "Струмица",
    status: "completed",
    typeLabel: "Трговско-деловен центар",
    year: 2008,
    // keep the GLOBAL sign in the 16:9 frame of the carousel (it sits at the top of the photos)
    imageFocus: { zoom: 1, x: 50, y: 6 },
    description:
      "Трговско-деловен центар во самиот центар на Струмица, на аголот на ул. „Ленинова“ и бул. „Маршал Тито“, спроти градскиот плоштад. Отворен во 2008 година и препознатлив по стаклената фасада.",
    // Photos from Wikimedia Commons (CC BY-SA), 2009–2015, before the fire of 2 January 2021: see docs/photo-credits.md.
    heroImage: {
      src: "/images/gtc-global/global-01.jpg",
      alt: "ГТЦ Глобал во Струмица, стаклена фасада кон плоштадот",
      isPlaceholder: false,
    },
    gallery: [
      {
        src: "/images/gtc-global/global-01.jpg",
        alt: "ГТЦ Глобал во Струмица, стаклена фасада кон плоштадот",
        isPlaceholder: false,
      },
      {
        src: "/images/gtc-global/global-02.jpg",
        alt: "ГТЦ Глобал во Струмица, заоблениот стаклен агол одоздола",
        isPlaceholder: false,
      },
      {
        src: "/images/gtc-global/global-03.jpg",
        alt: "ГТЦ Глобал во Струмица, поглед одозгора по булеварот",
        isPlaceholder: false,
      },
      {
        src: "/images/gtc-global/global-04.jpg",
        alt: "ГТЦ Глобал во Струмица, долгата страна покрај булеварот",
        isPlaceholder: false,
      },
    ],
    photoCredit: [
      { text: "Фото: " },
      { text: "Rašo", href: "https://commons.wikimedia.org/wiki/File:Strumica_X_(20).JPG" },
      { text: " и " },
      { text: "Тиверополник", href: "https://commons.wikimedia.org/wiki/File:Глобал_Струмица.jpg" },
      { text: " (" },
      { text: "CC BY-SA 3.0", href: "https://creativecommons.org/licenses/by-sa/3.0/" },
      { text: "), " },
      { text: "Македонец", href: "https://commons.wikimedia.org/wiki/File:Струмица-МК_03.JPG" },
      { text: " (" },
      { text: "CC BY-SA 4.0", href: "https://creativecommons.org/licenses/by-sa/4.0/" },
      { text: ") / Wikimedia Commons" },
    ],
    specifications: [],
    capabilities: { hasMasterplan: false, hasBuildings: false, hasApartmentSelection: false },
  },
  {
    id: "ilindenska",
    slug: "ilindenska",
    name: "Илинденска",
    location: "бул. „Гоце Делчев“, Струмица",
    city: "Струмица",
    status: "completed",
    typeLabel: "Станбено-деловна зграда",
    description:
      "Станбено-деловна зграда на бул. „Гоце Делчев“ во Струмица, со деловни простори во приземјето и станови на катовите.",
    // No photo yet: the card and the page work without one (docs/content-needed.md asks for it).
    heroImage: { src: "", alt: "Илинденска", isPlaceholder: true },
    gallery: [],
    specifications: [],
    capabilities: { hasMasterplan: false, hasBuildings: false, hasApartmentSelection: false },
  },
];

// ---- the apartments of every project

/** What is known of Станбена Куќа's seven apartments (its floors, areas and types are the project's own data). */
function stanbenaKukjaUnits(): SampleUnit[] {
  const types = projects.find((p) => p.id === "stanbena-kukja")?.apartmentTypes ?? [];
  const [ground, odd, even] = [types[0]?.image, types[2]?.image, types[1]?.image];
  return [
    { floor: 0, number: "1", area: 115, bedrooms: 3, bathrooms: 2, planImage: ground },
    ...[1, 2, 3].flatMap((floor) => [
      { floor, number: String(floor * 2), area: 87, bedrooms: 2, bathrooms: 1, planImage: even },
      { floor, number: String(floor * 2 + 1), area: 83, bedrooms: 2, bathrooms: 1, planImage: odd },
    ]),
  ];
}

/** Дојрански Рај: the studios per floor the floor list gives; the areas are sample values between 27 and 41 м². */
function dojranskiRajUnits(): SampleUnit[] {
  return dojranFloors.flatMap((floor) => {
    const count = Number.parseInt(floor.unitsHint, 10) || 0;
    return Array.from({ length: count }, (_, i) => ({
      floor: floor.number,
      number: `${floor.number}${String(i + 1).padStart(2, "0")}`,
      area: 27 + ((floor.number * 7 + i * 5) % 15),
      bedrooms: 0,
      bathrooms: 1,
    }));
  });
}

/**
 * Every apartment of every project, one list. City Center's are generated sample data (except Building 06, floor 3);
 * the projects without a list from the client get sample apartments made the same way, marked `sample`, until the real
 * lists arrive (docs/content-needed.md). A project with no entry here simply has no apartments yet.
 */
export const apartments: Apartment[] = [
  ...generated.apartments,
  ...buildSampleApartments("stanbena-kukja", 1, stanbenaKukjaUnits()),
  ...buildSampleApartments("dojranski-raj", 2, dojranskiRajUnits()),
];

export function getApartment(id: string): Apartment | undefined {
  return apartments.find((a) => a.id === id);
}

/** The apartments of one project. */
export function apartmentsOf(projectId: string): Apartment[] {
  return apartments.filter((a) => a.projectId === projectId);
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getBuilding(id: string): Building | undefined {
  return buildings.find((b) => b.id === id);
}

/** City Center's per-building floors (its own /development pages). */
export function getApartmentsForFloor(buildingId: string, floor: number): Apartment[] {
  return apartments.filter((a) => a.buildingId === buildingId && a.floor === floor);
}

const floorLabel = (number: number) => (number === 0 ? "Приземје" : `Кат ${number}`);

/** The name of an apartment's floor, as its building's data calls it ("Кат 2", "Поткровје"); a plain "Кат n" otherwise. */
export function floorLabelOf(a: Apartment): string {
  const building = getProject(a.projectId)?.buildings?.find((b) => b.id === a.buildingId);
  return building?.floors.find((f) => f.number === a.floor)?.label ?? floorLabel(a.floor);
}

/** A building of a project on sale, as the Пронајди стан street draws it. */
export interface SaleBuilding {
  /** The building's id; a project that is one building uses the project's id. */
  id: string;
  name: string;
  /** Lowest floor first; each with the ids of its apartments, in order. Empty while the project has no apartments yet. */
  floors: { number: number; label: string; apartmentIds: string[] }[];
}

export interface SaleProject {
  project: Project;
  buildings: SaleBuilding[];
  apartments: Apartment[];
}

/** The place an apartment is in: its building's id, or its project's id for a project that is one building. */
export const placeOf = (a: Apartment) => a.buildingId ?? a.projectId;

/**
 * The projects that are on sale (not the completed ones), in the order of the projects page, each with its buildings and
 * apartments. Everything that lists apartments reads through this: adding a project (and its apartments) to the data
 * makes it appear everywhere. A project with no apartments yet is still listed, as one building with no floors.
 */
export function projectsOnSale(): SaleProject[] {
  return projects
    .filter((p) => p.status !== "completed")
    .map((project) => {
      const own = apartments.filter((a) => a.projectId === project.id);
      const places: { id: string; name: string; labels?: Map<number, string> }[] = project.buildings?.length
        ? project.buildings
            .filter((b) => own.some((a) => a.buildingId === b.id))
            .map((b) => ({ id: b.id, name: b.name, labels: new Map(b.floors.map((f) => [f.number, f.label])) }))
        : [{ id: project.id, name: project.name }];
      const buildingsOfProject: SaleBuilding[] = places.map((place) => {
        const here = own.filter((a) => placeOf(a) === place.id);
        const numbers = [...new Set(here.map((a) => a.floor))].sort((a, b) => a - b);
        return {
          id: place.id,
          name: place.name,
          floors: numbers.map((number) => ({
            number,
            label: place.labels?.get(number) ?? floorLabel(number),
            apartmentIds: here.filter((a) => a.floor === number).map((a) => a.id),
          })),
        };
      });
      return { project, buildings: buildingsOfProject, apartments: own };
    });
}

/** Where an apartment is, for a label: the project, and the building when the project has several. */
export function placeLabel(a: Apartment): { project: string; building: string; text: string } {
  const project = getProject(a.projectId);
  const projectName = project?.name ?? "";
  const building = project?.buildings?.find((b) => b.id === a.buildingId)?.name ?? "";
  return { project: projectName, building, text: building ? `${projectName} · ${building}` : projectName };
}

export const companyStats: CompanyStat[] = [
  { value: "30+", label: "Години искуство" },
  { value: "5", label: "Завршени проекти" },
  { value: "540+", label: "Изградени станови" },
  // the buildings of the projects that are under construction (a project that is one building counts as one)
  {
    value: String(
      projects.filter((p) => p.status === "under-construction").reduce((n, p) => n + (p.buildings?.length ?? 1), 0)
    ),
    label: "Згради во изградба",
  },
];

/**
 * The "Нашиот пат" timeline on the About page — the one place to add milestones.
 * Only what the client has confirmed is listed: the founding, and the projects under construction (read from the projects data).
 * TODO(client): add the other milestones (year + one short sentence each) as they are confirmed.
 */
export const companyTimeline: CompanyMilestone[] = [
  {
    year: "1994",
    text: "Основање на Јавор Шпед.",
    image: { src: "/images/brand/holding-since-1994.jpg", alt: "Јавор Шпед, основан 1994" },
  },
  {
    year: "2026",
    text: `Во изградба: ${projects
      .filter((p) => p.status === "under-construction")
      .map((p) => p.name)
      .join(" и ")}.`,
    image: { src: "/images/exteriors/exterior-hero-wide.jpg", alt: "City Center — визуелизација" },
  },
];

export const companyInfo = {
  name: "Јавор Шпед",
  shortName: "Јавор Шпед",
  founded: 1994,
  story:
    "Основан во 1994 година, Јавор Шпед започна како шпедитерска и логистичка компанија, а денес прерасна во диверзифицирана холдинг група која опфаќа транспорт, енергетика, инженеринг и градежништво. Истата оперативна дисциплина ја пренесуваме и во станбената архитектура.",
  mission:
    "Да проектираме и градиме станбени простори кои го подобруваат начинот на живот — комбинирајќи современа архитектура, издржлива градба и транспарентна комуникација со секој купувач.",
  values: [
    {
      title: "Квалитет",
      description: "Премиум материјали и строга контрола на квалитет во секоја фаза на градбата.",
    },
    {
      title: "Сигурност",
      description: "Секој проект е испорачан согласно ветениот рок и спецификација.",
    },
    {
      title: "Иновација",
      description: "Современа архитектура и градежни методи, а не типски решенија.",
    },
    {
      title: "Транспарентност",
      description: "Искрена достапност и директна комуникација со купувачите.",
    },
  ],
  address: "Ул. Ленинова, ГТЦ Глобал, 4-ти кат, Струмица",
  phone: "+389 2 3123 456",
  email: "info@javorsped.mk",
  // TODO(client): the Viber / WhatsApp number (international form, e.g. "+389 70 123 456"). While it is
  // empty, the Контакт page leaves that row out rather than guessing a number.
  messengerNumber: "",
  // Where the map pin sits: Global Trade Center on Ленинова, Струмица, from OpenStreetMap.
  // TODO(client): confirm the exact entrance of the sales office.
  coordinates: { lat: 41.4389708, lng: 22.6390034 },
  hours: "Пон–Пет 09:00–18:00, Саб 10:00–14:00",
};
