export interface DojranFloor {
  number: number;
  label: string;
  unitsHint: string;
}

// Single-building floor list for Дојрански Рај (Стар Дојран - Сретеново).
// Per-apartment data will be added once the client sends per-unit photos.
export const dojranFloors: DojranFloor[] = [
  { number: 0, label: "Приземје", unitsHint: "1 стан" },
  { number: 1, label: "Кат 1", unitsHint: "2 станови" },
  { number: 2, label: "Кат 2", unitsHint: "2 станови" },
  { number: 3, label: "Кат 3", unitsHint: "2 станови" },
];

export function getDojranFloor(number: number): DojranFloor | undefined {
  return dojranFloors.find((f) => f.number === number);
}
