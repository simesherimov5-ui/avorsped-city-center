// The companies of the Јавор Шпед group. ONE shared list: used by the company
// ticker at the bottom of the site and by the clickable circle on the "За нас" page.
// Confirm spelling with the company before going live.
export type Company = {
  name: string;
  /** A short text for the circle, up to 280 characters (longer is cut at a word). Left out until the company sends it. */
  description?: string;
  /** The company's own website. Left out until the company sends it: no link is shown without it. */
  url?: string;
};

export const COMPANIES: Company[] = [
  { name: "Јавор Шпед Ол" },
  { name: "СДА Јавор" },
  { name: "Дисмак Ол" },
  { name: "Дисмак Транспорт" },
  { name: "Јавор Транс" },
  { name: "СИМ Инженеринг" },
  { name: "Хели-Центрум" },
  { name: "Енерџи Холдинг" },
  { name: "Exclusive Building" },
];

/** The company this website belongs to (highlighted, and first in the circle). */
export const THIS_COMPANY = "Exclusive Building";

/** The longest text the circle shows; its centre is sized for this. */
export const MAX_DESCRIPTION = 280;
