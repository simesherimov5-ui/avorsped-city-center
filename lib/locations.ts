/**
 * Where City Center is: the centre of the Google Maps view the owner sent (close to the site, not the exact pin), and the
 * small geometry the location maps need to place one location on the drawing of another.
 */
export const CITY_CENTER = { name: "City Center", lat: 41.4478557, lng: 22.6406895 } as const;

type Point = { lat: number; lng: number };

/** The distance between two points on the ground, in kilometres (the haversine formula). */
export function kilometres(a: Point, b: Point) {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** "850 м" under a kilometre (to the nearest 50), "1 км" or "1,4 км" above; the decimal comma is written by hand. */
export function distanceLabel(km: number) {
  if (km < 0.95) return `${Math.round((km * 1000) / 50) * 50} м`;
  const rounded = Math.round(km * 10) / 10;
  return `${String(rounded).replace(".", ",")} км`;
}

/**
 * Where `to` sits on a 400 × 300 drawing whose pin (the place `from`) is at 200, 140, north up, 95 units to the
 * kilometre, kept clear of the edges so its label fits.
 */
export function spotOnDrawing(from: Point, to: Point) {
  const unitsPerKm = 95;
  const east = (to.lng - from.lng) * 111.32 * Math.cos(((from.lat + to.lat) / 2) * (Math.PI / 180));
  const north = (to.lat - from.lat) * 111.2;
  const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
  return {
    x: Math.round(clamp(200 + east * unitsPerKm, 60, 340)),
    y: Math.round(clamp(140 - north * unitsPerKm, 40, 250)),
  };
}
