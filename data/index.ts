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
    typeLabel: "Станбена Кука",
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
    id: "riverside-terraces",
    slug: "riverside-terraces",
    name: "Ривърсајд Терас",
    location: "Скопје, Северна Македонија",
    status: "completed",
    year: 2022,
    units: 84,
    description:
      "Бутик резиденција крај реката со 84 станови, пејзажирани тераси и директен пристап до крајбрежната промонада, завршена во рок во 2022 година.",
    heroImage: { src: "", alt: "Ривърсајд Терас", isPlaceholder: true },
    gallery: [
      { src: "", alt: "Ривърсајд Терас - визуелизација 1", isPlaceholder: true },
      { src: "", alt: "Ривърсајд Терас - визуелизација 2", isPlaceholder: true },
    ],
    specifications: [
      { label: "Згради", value: "2" },
      { label: "Вкупно станови", value: "84" },
      { label: "Завршено", value: "2022" },
      { label: "Локација", value: "Скопје, Северна Македонија" },
    ],
  },
  {
    id: "oakwood-residence",
    slug: "oakwood-residence",
    name: "Оквуд Резиденс",
    location: "Охрид, Северна Македонија",
    status: "completed",
    year: 2020,
    units: 46,
    description:
      "Ниска станбена зграда во близина на Охридското Езеро, која ги комбинира традиционалните материјали со современ архитектонски јазик.",
    heroImage: { src: "", alt: "Оквуд Резиденс", isPlaceholder: true },
    gallery: [{ src: "", alt: "Оквуд Резиденс - визуелизација 1", isPlaceholder: true }],
    specifications: [
      { label: "Згради", value: "1" },
      { label: "Вкупно станови", value: "46" },
      { label: "Завршено", value: "2020" },
      { label: "Локација", value: "Охрид, Северна Македонија" },
    ],
  },
  {
    id: "park-residences",
    slug: "park-residences",
    name: "Парк Резиденс",
    location: "Скопје, Северна Македонија",
    status: "completed",
    year: 2018,
    units: 120,
    description:
      "Еден од првите поголеми проекти на компанијата — 120 станови распоредени во три згради околу приватен парк.",
    heroImage: { src: "", alt: "Парк Резиденс", isPlaceholder: true },
    gallery: [{ src: "", alt: "Парк Резиденс - визуелизација 1", isPlaceholder: true }],
    specifications: [
      { label: "Згради", value: "3" },
      { label: "Вкупно станови", value: "120" },
      { label: "Завршено", value: "2018" },
      { label: "Локација", value: "Скопје, Северна Македонија" },
    ],
  },
  {
    id: "vista-heights",
    slug: "vista-heights",
    name: "Виста Хајтс",
    location: "Битола, Северна Македонија",
    status: "upcoming",
    year: 2028,
    units: 96,
    description:
      "Најавено за 2028 година: станбена зграда на ридест терен со 96 станови и панорамски поглед на градот, моментално во фаза на проектирање.",
    heroImage: { src: "", alt: "Виста Хајтс", isPlaceholder: true },
    gallery: [{ src: "", alt: "Виста Хајтс - концептуална визуелизација", isPlaceholder: true }],
    specifications: [
      { label: "Згради", value: "2" },
      { label: "Вкупно станови", value: "96" },
      { label: "Очекуван почеток", value: "2027" },
      { label: "Локација", value: "Битола, Северна Македонија" },
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
