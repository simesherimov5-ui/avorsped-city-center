/** One form for exactly 1, another for everything else: "1 достапен", "2 достапни". */
export const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

/** "достапен" / "достапни", to follow a count. */
export const availableWord = (count: number) => plural(count, "достапен", "достапни");

/** "1 стан", "2 станови". */
export const unitsText = (count: number) => `${count} ${plural(count, "стан", "станови")}`;

/** "1 кат", "2 ката". */
export const floorsText = (count: number) => `${count} ${plural(count, "кат", "ката")}`;
