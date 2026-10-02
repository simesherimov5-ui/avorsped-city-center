import { generateDevelopment } from "./generate";
import type { Apartment, Building, CompanyMilestone, CompanyStat, Project } from "@/types";

const generated = generateDevelopment();

export const development = generated.development;
export const apartments: Apartment[] = generated.apartments;
export const buildings: Building[] = generated.development.buildings;

export function getApartment(id: string): Apartment | undefined {
  return apartments.find((a) => a.id === id);
}

export function getBuilding(id: string): Building | undefined {
  return buildings.find((b) => b.id === id);
}

export function getApartmentsForFloor(buildingId: string, floor: number): Apartment[] {
  return apartments.filter((a) => a.buildingId === buildingId && a.floor === floor);
}

export function availabilityCounts(list: Apartment[] = apartments) {
  return {
    available: list.filter((a) => a.status === "available").length,
    reserved: list.filter((a) => a.status === "reserved").length,
    sold: list.filter((a) => a.status === "sold").length,
    total: list.length,
  };
}

export const projects: Project[] = [
  {
    id: "city-center",
    slug: "city-center",
    name: "City Center",
    location: "Ул. Ленинова, Струмица, Северна Македонија",
    status: "under-construction",
    year: 2027,
    units: development.totalApartments,
    description: development.description,
    tagline: "Најдобрата локација за вашиот нов дом",
    distanceHighlights: ["250 м од градски парк", "500 м од центарот на градот"],
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
    id: "vista-heights",
    slug: "vista-heights",
    name: "Станбена Куќа",
    location: "Ул. Цветан Димов бр. 16, Струмица, Северна Македонија",
    status: "upcoming",
    statusLabelOverride: "Coming soon",
    year: 2028,
    units: 7,
    description:
      "Објект проектиран по најсовремени стандарди и нормативи, со функционални станови и високо ниво на технологија. Лоциран во мирен дел на градот, во близина на градскиот парк, училишта, болници, супермаркети и спортски сали.",
    imageFit: "contain",
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
        "dnevna-soba": { label: "Дневна соба", video: "/videos/stanbena-zgrada/dnevna-soba.mp4" },
        kujna: { label: "Кујна и трпезарија", video: "/videos/stanbena-zgrada/kujna.mp4" },
        dvor: { label: "Двор", video: "/videos/stanbena-zgrada/dvor.mp4" },
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
    status: "under-construction",
    year: 2027,
    units: 30,
    description:
      "Гарсоњери од 27 до 41 м2 на чекор од Дојранското Езеро, во Сретеново, Стар Дојран (плажа Фук Так). Природа, сонце, чист воздух и медитеранска клима — совршена локација за одмор и живот без грижа.",
    tagline: "Дојран како никогаш досега",
    distanceHighlights: ["На плажа Фук Так", "Чекор до Дојранското Езеро"],
    href: "/dojran",
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
      { label: "Површини", value: "27 до 41 м2" },
      { label: "Цена", value: "1 250 до 1 350 €/м2 со ДДВ" },
      { label: "Вселување", value: "Јули 2027" },
      { label: "Контакт", value: "071/333-088" },
    ],
    capabilities: { hasMasterplan: false, hasBuildings: false, hasApartmentSelection: false },
  },
];

export const companyStats: CompanyStat[] = [
  { value: "30+", label: "Години искуство" },
  { value: "5", label: "Завршени проекти" },
  { value: "540+", label: "Изградени станови" },
  { value: "6", label: "Згради во изградба" },
];

/**
 * The "Нашиот пат" timeline on the About page — the one place to add milestones.
 * Only what the client has confirmed is listed: the founding, and the current City Center project.
 * TODO(client): add the other milestones (year + one short sentence each) as they are confirmed.
 */
export const companyTimeline: CompanyMilestone[] = [
  { year: "1994", text: "Основање на Јавор Шпед." },
  { year: "2026", text: "City Center — шест згради во изградба." },
];

export const companyInfo = {
  name: "Јавор Шпед",
  shortName: "Јавор Шпед",
  founded: 1994,
  story:
    "Основан во 1994 година, Јавор Шпед започна како шпедитерска и логистичка компанија, а денес прерасна во диверзифицирана холдинг група која опфаќа транспорт, енергетика, инженеринг и градежништво. Exclusive Building, нашиот огранок за недвижности и градежништво, ја пренесува истата оперативна дисциплина и во станбената архитектура — а City Center е нејзиниот досега најамбициозен проект.",
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
      description: "Јасни цени, искрена достапност и директна комуникација со купувачите.",
    },
  ],
  address: "Ул. Ленинова, ГТЦ Глобал, 4-ти кат, Струмица",
  phone: "+389 2 3123 456",
  email: "info@javorsped.mk",
  // TODO(client): the Viber / WhatsApp number (international form, e.g. "+389 70 123 456"). While it is
  // empty, the Контакт page leaves that row out rather than guessing a number.
  messengerNumber: "",
  hours: "Пон–Пет 09:00–18:00, Саб 10:00–14:00",
};
