/**
 * The furnished 3D renders of the apartments (cleaned of their original number labels), shown in the «3D» tab of an
 * apartment's plan viewer. One file is shared by every apartment of the same layout. An apartment gets the ОСНОВА / 3D
 * tabs once its file is in public/ (lib/render3d.ts); until then, or when it is not listed, the viewer has no tabs.
 * Another building gets renders by adding its rows here and its files, nothing else.
 */
const RENDERS_3D: { file: string; apartmentIds: string[] }[] = [
  // City Center, Зграда 02 (lamela 2): Стан 1 to 5 on the first floor, then the five layouts of floors 2 to ПК
  { file: "/images/renders-3d/lamela-2/stan-1.webp", apartmentIds: ["b02-f1-1"] },
  { file: "/images/renders-3d/lamela-2/stan-2.webp", apartmentIds: ["b02-f1-2"] },
  { file: "/images/renders-3d/lamela-2/stan-3.webp", apartmentIds: ["b02-f1-3"] },
  { file: "/images/renders-3d/lamela-2/stan-4.webp", apartmentIds: ["b02-f1-4"] },
  // the approved render with the long terrace
  { file: "/images/renders-3d/lamela-2/stan-5.webp", apartmentIds: ["b02-f1-5"] },
  {
    file: "/images/renders-3d/lamela-2/stan-6-11-16-21-26.webp",
    apartmentIds: ["b02-f2-6", "b02-f3-11", "b02-f4-16", "b02-f5-21", "b02-f6-26"],
  },
  {
    file: "/images/renders-3d/lamela-2/stan-7-12-17-22-27.webp",
    apartmentIds: ["b02-f2-7", "b02-f3-12", "b02-f4-17", "b02-f5-22", "b02-f6-27"],
  },
  {
    file: "/images/renders-3d/lamela-2/stan-8-13-18-23-28.webp",
    apartmentIds: ["b02-f2-8", "b02-f3-13", "b02-f4-18", "b02-f5-23", "b02-f6-28"],
  },
  {
    file: "/images/renders-3d/lamela-2/stan-9-14-19-24-29.webp",
    apartmentIds: ["b02-f2-9", "b02-f3-14", "b02-f4-19", "b02-f5-24", "b02-f6-29"],
  },
  {
    file: "/images/renders-3d/lamela-2/stan-10-15-20-25-30.webp",
    apartmentIds: ["b02-f2-10", "b02-f3-15", "b02-f4-20", "b02-f5-25", "b02-f6-30"],
  },
];

const renderByApartment = new Map(RENDERS_3D.flatMap(({ file, apartmentIds }) => apartmentIds.map((id) => [id, file])));

/** The 3D render file (a path under public/) mapped to an apartment, or undefined when it has none (no 3D tab). */
export function render3dFor(apartmentId: string): string | undefined {
  return renderByApartment.get(apartmentId);
}

/** Every render file and the apartments that use it. */
export const renders3d: readonly { file: string; apartmentIds: readonly string[] }[] = RENDERS_3D;
