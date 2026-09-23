// Centralized type definitions for the entire data model.
// Designed so a future CMS/backend can populate these shapes without UI changes.

export type UnitStatus = "available" | "reserved" | "sold";

export type Orientation =
  | "North"
  | "South"
  | "East"
  | "West"
  | "North-East"
  | "North-West"
  | "South-East"
  | "South-West";

export interface Room {
  name: string;
  area: number; // m²
}

export interface FloorPlanShape {
  /** Normalized 0-100 polygon points, room-agnostic outline for the unit within the floor SVG */
  points: [number, number][];
  labelPosition: [number, number];
}

export interface Apartment {
  id: string; // e.g. "b03-f05-503"
  buildingId: string;
  floor: number;
  number: string; // "503"
  type: "1-bedroom" | "2-bedroom" | "3-bedroom" | "4-bedroom" | "studio";
  bedrooms: number;
  bathrooms: number;
  area: number; // m² interior
  balconyArea: number; // m²
  orientation: Orientation;
  price: number; // EUR
  status: UnitStatus;
  rooms: Room[];
  shape: FloorPlanShape;
  gallery: { src: string; alt: string; isPlaceholder: boolean }[];
  tour?: { available: boolean; type: "360" | "matterport" | "glb" | "none" };
}

export interface Floor {
  number: number; // 0 = ground
  label: string; // "Ground", "Floor 1", ...
  apartmentIds: string[];
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
}

export type ProjectStatus = "completed" | "under-construction" | "upcoming";

export interface Project {
  id: string;
  slug: string;
  name: string;
  location: string;
  status: ProjectStatus;
  year: number;
  units: number;
  description: string;
  heroImage: { src: string; alt: string; isPlaceholder: boolean };
  gallery: { src: string; alt: string; isPlaceholder: boolean }[];
  specifications: { label: string; value: string }[];
  isFlagship?: boolean;
  typeLabel?: string;
  statusLabelOverride?: string;
  tagline?: string;
  distanceHighlights?: string[];
  href?: string;
  apartmentTypes?: {
    label: string;
    area: string;
    image: { src: string; alt: string; isPlaceholder: boolean };
  }[];
}

export interface CompanyStat {
  value: string;
  label: string;
}

export interface ConsultationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate?: string;
  preferredTime?: string;
  project?: string;
  buildingId?: string;
  apartmentId?: string;
  message?: string;
  kind: "consultation" | "call-request" | "info-request" | "apartment-inquiry";
}

export interface ApartmentFilterState {
  buildingId?: string;
  floor?: number;
  bedrooms?: number;
  minArea?: number;
  maxArea?: number;
  maxPrice?: number;
  status?: UnitStatus;
  orientation?: Orientation;
}
