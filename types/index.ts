// Centralized type definitions for the entire data model.
// Designed so a future CMS/backend can populate these shapes without UI changes.

export type MediaImage = { src: string; alt: string; isPlaceholder: boolean };

export type UnitStatus = "available" | "reserved" | "sold";

export type Orientation =
  "North" | "South" | "East" | "West" | "North-East" | "North-West" | "South-East" | "South-West";

export interface Room {
  name: string;
  area: number; // m²
}

/** Where an apartment is on its floor's sketch: its outline (balcony included) and the point for its number, in percent of the sketch. */
export interface ApartmentOutline {
  /** x from the left edge, y from the top edge, in percent of the floor sketch. */
  polygon: [number, number][];
  label: [number, number];
}

/** A drawing (a floor sketch or an apartment plan) with its own pixel size. */
export type DrawingImage = MediaImage & { width: number; height: number };

export interface Apartment {
  /** Unique across every project, e.g. "b03-f5-24" or "stanbena-kukja-f1-2". */
  id: string;
  /** The project the apartment belongs to (the id of an entry of `projects`). */
  projectId: string;
  /** The building within the project; left out for a project that is one building. */
  buildingId?: string;
  /** True for generated sample data, until the client sends the real apartment list of the project. */
  sample?: true;
  /** The apartment's own plan or render, where the project has one; without it the apartment shows an empty frame. */
  planImage?: MediaImage & {
    /** Dark lines on a transparent background: it must sit on a light surface. */
    transparent?: true;
    width?: number;
    height?: number;
  };
  /** Where it is on its floor's sketch, where the floor has one. */
  outline?: ApartmentOutline;
  floor: number;
  /** As on the drawing: text ("21", "11a"). */
  number: string;
  type: "1-bedroom" | "2-bedroom" | "3-bedroom" | "4-bedroom" | "5-bedroom" | "studio";
  /** The type as the drawing writes it ("Трособен"), where there is one. */
  typeLabel?: string;
  /** The number of «соби» as the site shows it ("3 соби"). */
  bedrooms: number;
  bathrooms: number;
  area: number; // m² total
  /** How many decimals the area is written with (2 for an apartment from the architect's drawing); one where left out. */
  areaDecimals?: number;
  balconyArea: number; // m²
  /** Left out where the architect's drawing does not say. */
  orientation?: Orientation;
  status: UnitStatus;
  /** The rooms and terraces with their areas, in the order of the drawing. */
  rooms: Room[];
  gallery: { src: string; alt: string; isPlaceholder: boolean }[];
  tour?: { available: boolean; type: "360" | "matterport" | "glb" | "none" };
}

export interface Floor {
  number: number; // 0 = ground
  label: string; // "Кат 1", "Поткровје"
  apartmentIds: string[];
  /** This floor's own sketch, where the architect's drawing exists. The apartments carry their shapes on it. */
  sketch?: DrawingImage;
}

export interface Building {
  id: string; // "b01"
  name: string; // "Building 01"
  shortLabel: string; // "01"
  floors: Floor[];
  totalApartments: number;
  exteriorImage: { src: string; alt: string; isPlaceholder: boolean };
  status: "planning" | "foundation" | "structure" | "exterior" | "interior" | "completed";
  position: { row: number; col: number }; // grid position in the masterplan
  /** A short text about the building, shown in the building picker. */
  description?: string;
}

export interface ConstructionStage {
  key: "planning" | "foundation" | "structure" | "exterior" | "interior" | "completion";
  label: string;
  date: string;
  percentComplete: number;
  description: string;
  image: { src: string; alt: string; isPlaceholder: boolean };
}

/** The five phases every building project goes through, in order. */
export type ConstructionPhase = "foundation" | "structure" | "facade" | "interior" | "handover";

/**
 * Where a building project stands, kept next to the project so it is updated in one place.
 * Every phase before `currentPhase` is shown as done, every one after it as upcoming.
 */
export interface ConstructionProgressData {
  currentPhase: ConstructionPhase;
  /** 0–100: how far along the current phase is. */
  percent: number;
  /** Handover, shown under the last phase, e.g. "2027" or "Q2 2027". */
  handover: string;
  /** ISO date (YYYY-MM-DD) of the last update; "Ажурирано: …" is only shown when this is set. */
  updated?: string;
}

export interface Development {
  id: string;
  name: string;
  location: string;
  description: string;
  buildings: Building[];
  totalApartments: number;
  expectedCompletion: string;
  constructionStages: ConstructionStage[];
  heroImage: { src: string; alt: string; isPlaceholder: boolean };
  nearbyPoints: { name: string; category: string; distance: string }[];
  mapQuery: string;
  /** Aerial/site-plan photo used by the interactive masterplan explorer. */
  masterplanImage: MediaImage;
  /** Marker positions for each building.id over masterplanImage, as percentages. */
  buildingHotspots: Record<string, { top: string; left: string }>;
}

export type ProjectStatus = "completed" | "under-construction" | "upcoming";

export interface RoomTourRoom {
  label: string;
  image: { src: string; alt: string; isPlaceholder: boolean };
  video: string;
}

export interface FloorPlanHotspot {
  number: number;
  top: string; // percentage, e.g. "34.0%"
  left: string;
  room?: string; // key into FloorPlanExplorerData.rooms
}

export interface FloorPlanExplorerData {
  image: { src: string; alt: string; isPlaceholder: boolean };
  hotspots: FloorPlanHotspot[];
  rooms: Record<string, { label: string; video: string; /** Still shown until the video plays. */ poster?: string }>;
}

/** One entry of the About page timeline. */
export interface CompanyMilestone {
  year: string;
  text: string;
  /** Optional photo of the milestone; without one the card shows the year in a frame. */
  image?: { src: string; alt: string };
}

/**
 * How a project's photos sit in their frames. zoom 1 fills the frame (the default); below 1 shows more of the
 * photo (the picture sits inside the frame with a blurred copy behind it); x and y are the focal point in %.
 */
export interface ImageFocus {
  zoom: number;
  x: number;
  y: number;
  /** Width ÷ height of the project's photos (3200 × 1600 is 2). Lets the picture be sized from the frame alone. */
  aspect?: number;
}

export interface ProjectAbout {
  kicker: string;
  title: string;
  /** The end of the heading, set in Бронза. */
  titleItalic: string;
  paragraphs: string[];
  /** Phrases of the paragraphs set in Playfair and the accent colour (each where it first appears). */
  accents?: string[];
  signature: string;
  /** The heading in English (the paragraphs stay as written). */
  en?: { kicker: string; title: string; titleItalic: string };
}

/** A heading in two parts: the second part is set in the accent colour. */
export interface SplitTitle {
  title: string;
  titleItalic: string;
}

export interface MaterialItem {
  name: string;
  /** "Where it is used · maker". */
  note: string;
  image?: { src: string; alt: string };
}

export interface ProjectProgress extends SplitTitle {
  /** The line under the heading. */
  lede?: string;
  /** ISO date of the last update, or free text; a [placeholder] is shown while it is missing. */
  updated?: string;
  /** Per phase: the month it is planned or done in, and a photo from the site. */
  phases?: Partial<Record<ConstructionPhase, { date?: string; photo?: { src: string; alt: string } }>>;
}

export interface ResidentQuote {
  text: string;
  name: string;
  project: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  location: string;
  /** The town the project is in (the projects page groups by it). */
  city: string;
  status: ProjectStatus;
  /** Hidden where not known. */
  year?: number;
  /** Number of apartments; hidden where not known. */
  units?: number;
  description: string;
  heroImage: { src: string; alt: string; isPlaceholder: boolean };
  /** The photo of the slideshow at the top of the Проекти page: exactly 16:9, so it is shown whole. A project without one is not in the slideshow. */
  slideImage?: { src: string; alt: string; isPlaceholder: boolean };
  gallery: { src: string; alt: string; isPlaceholder: boolean }[];
  specifications: { label: string; value: string }[];
  /** How gallery/hero images should fit their frame — "contain" for near-square source photos that would otherwise be aggressively cropped. */
  imageFit?: "cover" | "contain";
  /** Per-project framing of every photo of the project (see ImageFocus). Projects without it keep zoom 1. */
  imageFocus?: ImageFocus;
  typeLabel?: string;
  /** The credit line under the photos, in pieces: plain text and links (licence terms require it). */
  photoCredit?: { text: string; href?: string }[];
  statusLabelOverride?: string;
  tagline?: string;
  /**
   * The cinematic opening of the project page (the 16:9 picture or film under the header, the text on it from 1101px wide and below it under that). A project without
   * `heroOpening` keeps the ordinary page top.
   */
  heroOpening?: boolean;
  /**
   * The film of the opening (muted, no sound), paths under public/: `hd` 1080p for screens wider than 1280px, `sd` 720p
   * for the rest, and the `poster` frame that is shown first, and alone where the film does not play (up to 1100px wide,
   * reduced motion, Save-Data). Without it the hero image is shown.
   */
  heroFilm?: { hd: string; sd: string; poster: string };
  /**
   * The photos of the opening's slideshow, in order (files the site already uses). `focus` holds a photo where the frame
   * trims it (x, y in %, zoom 1), so the trim comes out of sky or ground, not out of the buildings. Without it the opening
   * shows the hero image alone.
   */
  openingSlides?: {
    image: { src: string; alt: string; isPlaceholder: boolean };
    focus?: ImageFocus;
    /** The photo's own width in pixels: the page never asks for a wider variant. */
    maxWidth?: number;
  }[];
  /** The line under the name in the opening; split at its first comma (sans, then serif). Falls back to `tagline`. */
  openingTagline?: string;
  /** The "За проектот" section under the opening. Without it the page has no such section. */
  about?: ProjectAbout;
  /** Direction of north on the aerial photo of the building picker, in degrees (0 = up, clockwise). Without it: no compass. */
  masterplanNorth?: number;
  /** The "Материјали" section: its heading, the materials and who equipped the project. */
  materialsHeading?: SplitTitle;
  materials?: MaterialItem[];
  equippedBy?: string;
  /** The "Паркинг" section. */
  parking?: SplitTitle & { text: string };
  /** The "Локација" list of places and how long it takes to walk there. */
  walking?: SplitTitle & { places: { name: string; time: string }[] };
  /** The "Тек на градба" section (the phase itself comes from `construction.currentPhase`). */
  progress?: ProjectProgress;
  /** The "Закажете средба" section. */
  book?: SplitTitle & { text: string };
  distanceHighlights?: string[];
  /** Optional dedicated deep-dive page for this project (e.g. a multi-building explorer). Falls back to the generic /projects/[slug] page. */
  href?: string;
  /** The floors of a single-building project, bottom to top; their apartments are added once the details arrive. */
  floors?: { number: number; label: string }[];
  apartmentTypes?: {
    label: string;
    area: string;
    image: { src: string; alt: string; isPlaceholder: boolean };
  }[];
  /** Optional room-by-room video tour, shown on the generic project page when present. */
  roomTour?: RoomTourRoom[];
  /** Optional clickable, numbered floor-plan diagram with per-room video playback. */
  floorPlanExplorer?: FloorPlanExplorerData;
  /** Optional construction-progress timeline, shown on the generic project page when present. */
  constructionStages?: ConstructionStage[];
  /** Phase-by-phase progress; shown on the page and card of any project whose status is "under-construction". */
  construction?: ConstructionProgressData;
  /** Optional buildings for projects with building-level selection (e.g. the consultation form's dependent "building of interest" field). */
  buildings?: Building[];
  /**
   * Declares which exploration stages this project actually supports, so
   * shared UI (nav CTAs, the project page's "explore" entry point) can
   * branch on stated intent instead of re-deriving it from data shape every
   * time. Never used to force a stage a project has no real data for —
   * a future project can leave any of these false/undefined.
   */
  capabilities?: {
    hasMasterplan?: boolean;
    hasBuildings?: boolean;
    hasApartmentSelection?: boolean;
  };
  /**
   * Only the name, the city and the status are known so far: the project has a card on Проекти (and Завршени проекти)
   * and a plain page of its own, and stays out of the homepage slideshow, «Другите наши проекти» and the contact form.
   */
  stub?: boolean;
  /** The photo of the project's card on the Проекти grid, when it is not the hero photo. */
  cardImage?: { src: string; alt: string; isPlaceholder: boolean };
  /** The page layout: "diptych" is the photo-led page (two-photo hero, intro with facts, gallery, location). */
  layout?: "diptych";
  /** The diptych hero's photo pairs, as positions in `gallery` (each pair the same light, two different views). */
  heroPairs?: [number, number][];
  /** The heading of the page's intro; the second part is set in the accent colour. */
  intro?: SplitTitle;
  /** The intro's facts beside the heading (the city and the status are added from the project). */
  facts?: { label: string; value: string }[];
  /** Where the project is on the map. `approximate` while it only marks the town: replace it with the address. */
  place?: { lat: number; lng: number; approximate?: boolean };
  /** The objects (buildings) of a project picked on its drawn site plan; floors and units are attached later. */
  objects?: ProjectObject[];
  /** The drawn site plan of the object picker, in the plan's own units (`viewBox`). */
  sitePlan?: SitePlan;
}

/** One building of a project on its site plan. */
export interface ProjectObject {
  id: string;
  /** 1, 2, … as on the plan. */
  number: number;
  /** The building plot, e.g. "ГП Ѓ30". */
  plot: string;
  status: ProjectStatus;
  /** Filled in once the floors are known (none yet). */
  floors?: { number: number; label: string }[];
}

type PlanRect = { x: number; y: number; width: number; height: number };

/** A simple drawing of a site plan (streets, the plot, parking, lawns and the objects), traced from the architect's. */
export interface SitePlan {
  viewBox: string;
  /** Where north is, in degrees clockwise from up. */
  north: number;
  /** Streets as centrelines with a width; the named ones carry a label placed along them. */
  streets: { d: string; width: number; label?: string; labelAt?: { x: number; y: number }; labelAngle?: number }[];
  site: PlanRect & { radius: number };
  innerStreets: PlanRect[];
  parking: PlanRect[];
  lawns: PlanRect[];
  /** Each object's footprint, by its id. */
  footprints: Record<string, PlanRect>;
}

export interface CompanyStat {
  value: string;
  label: string;
}
