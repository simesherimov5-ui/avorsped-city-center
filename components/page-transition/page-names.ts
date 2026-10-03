// The name shown in gold on the curtain. Every label already exists on the site (navbar, footer, page
// headings) — nothing is invented here. The first matching prefix wins.
const NAMES: [prefix: string, name: string][] = [
  ["/completed-projects", "Завршени проекти"],
  ["/projects", "Проекти"],
  ["/about", "За нас"],
  ["/contact", "Контакт"],
  ["/apartments", "Пронајди стан"],
  ["/compare", "Споредба"],
  ["/development", "City Center"],
  ["/dojran", "Дојрански Рај"],
];

export function pageName(pathname: string) {
  if (pathname === "/") return "Почетна";
  return NAMES.find(([prefix]) => pathname === prefix || pathname.startsWith(prefix + "/"))?.[1] ?? "Јавор Шпед";
}
