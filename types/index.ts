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
  /** The end of the heading, set in italic Бронза. */
  titleItalic: string;
  paragraphs: string[];
  signature: string;
  /** The heading in English (the paragraphs stay as written). */
  en?: { kicker: string; title: string; titleItalic: string };
}

/** A heading in two parts: the second part is set in italic, in the accent colour. */
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
   * The cinematic opening of the project page (full-screen picture or film, the name low and centred). A project without
   * `heroOpening` keeps the ordinary page top.
   */
  heroOpening?: boolean;
  /** A short drone film for the opening, a path under public/ (mp4). Without it the hero image is shown, slowly settling. */
  heroVideo?: string;
  /** False when the film has no sound track, so the page shows no sound button. Default: it has sound. */
  heroVideoSound?: boolean;
  /** The line under the name in the opening; split at its first comma (sans, then serif italic). Falls back to `tagline`. */
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
}

export interface CompanyStat {
  value: string;
  label: string;
}
