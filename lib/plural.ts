/** One form for exactly 1, another for everything else: "1 стан", "2 станови". */
export const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

/** "1 стан", "2 станови". */
export const unitsText = (count: number) => `${count} ${plural(count, "стан", "станови")}`;

/** "1 кат", "2 ката". */
export const floorsText = (count: number) => `${count} ${plural(count, "кат", "ката")}`;

/** "1 соба", "2 соби". */
export const roomsText = (count: number) => `${count} ${plural(count, "соба", "соби")}`;
