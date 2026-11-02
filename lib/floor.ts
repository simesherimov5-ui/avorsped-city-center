/** A floor in a sentence or a title: "Кат 01" … "Кат 05", and "Поткровје" for the attic (its short label is ПК). */
export const floorTitle = (label: string) =>
  label === "ПК" ? "Поткровје" : /^\d+$/.test(label) ? `Кат ${label}` : label;
