import { generateDevelopment } from "./generate";
import type { Apartment, Building, CompanyStat, Project } from "@/types";

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
      { src: "/images/exteriors/exterior-gallery-1.jpg", alt: "City Center - визуелизација 1", isPlaceholder: false },
      { src: "/images/exteriors/exterior-gallery-2.jpg", alt: "City Center - визуелизација 2", isPlaceholder: false },
      { src: "/images/site/masterplan-aerial.jpg", alt: "City Center - ситуационен план", isPlaceholder: false },
    ],
    specifications: [
      { label: "Згради", value: "6" },
      { label: "Вкупно станови", value: String(development.totalApartments) },
      { label: "Очекуван завршеток", value: development.expectedCompletion },
      { label: "Локација", value: development.location },
    ],
    isFlagship: true,
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
    heroImage: { src: "", alt: "Станбена Куќа", isPlaceholder: true },
    gallery: [{ src: "", alt: "Станбена Куќа - концептуална визуелизација", isPlaceholder: true }],
    specifications: [
      { label: "Локација", value: "Ул. Цветан Димов бр. 16, Струмица" },
      { label: "Вкупно станови", value: "7" },
      { label: "Тип станови", value: "Четирисобен (приземје), трособни (кат 1-3)" },
      { label: "Ориентација", value: "Североисток / Југозапад" },
    ],
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
      "Гарсоњери од 27 до 41 м2 на чекор од Дојранското Езеро, во Сретеново - Стар Дојран (плажа Фук Так). Природа, сонце, чист воздух и медитеранска клима — совршена локација за одмор и живот без грижа.",
    tagline: "Дојран како никогаш досега",
    distanceHighlights: ["На плажа Фук Так", "Чекор до Дојранското Езеро"],
    heroImage: { src: "", alt: "Дојрански Рај", isPlaceholder: true },
    gallery: [{ src: "", alt: "Дојрански Рај - визуелизација", isPlaceholder: true }],
    specifications: [
      { label: "Локација", value: "Стар Дојран - Сретеново (плажа Фук Так)" },
      { label: "Површини", value: "27 - 41 м2" },
      { label: "Цена", value: "1 250 - 1 350 €/м2 со ДДВ" },
      { label: "Вселување", value: "Јули 2027" },
      { label: "Контакт", value: "071/333-088" },
    ],
  },
];

export const companyStats: CompanyStat[] = [
  { value: "30+", label: "Години искуство" },
  { value: "5", label: "Завршени проекти" },
  { value: "540+", label: "Изградени станови" },
  { value: "6", label: "Згради во изградба" },
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
  groupCompanies: [
    "Јавор Шпед Ол",
    "СДА Јавор",
    "Дисмак Ол",
    "Дисмак Транспорт",
    "Јавор Транс",
    "СИМ Инженеринг",
    "Хели-Центрум",
    "Енерџи Холдинг",
    "Exclusive Building",
  ],
  address: "Ул. Ленинова, ГТЦ Глобал, 4-ти кат, Струмица",
  phone: "+389 2 3123 456",
  email: "info@javorsped.mk",
  hours: "Пон–Пет 09:00–18:00, Саб 10:00–14:00",
};
