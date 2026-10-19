/**
 * Where City Center is: the centre of the Google Maps view the owner sent (close to the site, not the exact pin).
 */
export const CITY_CENTER = { name: "City Center", lat: 41.4478557, lng: 22.6406895 } as const;

/**
 * The place the Контакт page's map shows and its "Отвори во Google Maps" link opens, in ONE value. Swap the text for the
 * exact coordinates ("41.43xx,22.64xx") here to pin the building itself.
 */
export const CONTACT_MAP_QUERY = "ГТЦ Глобал, Струмица";

/** The Google Maps embed (no API key) for a place or a "lat,lng". */
export const mapEmbedUrl = (query: string) =>
  `https://www.google.com/maps?${new URLSearchParams({ q: query, z: "16", output: "embed" })}`;

/** The Google Maps page for a place or a "lat,lng", for a link that opens it. */
export const mapSearchUrl = (query: string) =>
  `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query })}`;
