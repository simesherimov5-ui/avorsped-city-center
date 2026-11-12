import type { ReactNode } from "react";

/**
 * The type scale of Почетна, Проекти, City Center, Дојран and Завршени проекти: its children are inside `.type-up`
 * (app/globals.css), which sets --type-scale to 1.2. A server component on purpose: the class is in the first HTML, so the
 * text has its size on first paint. `contents` keeps the wrapper out of the layout. The header and the footer are outside
 * <main> and За нас and Контакт are not wrapped, so none of them is scaled.
 */
export function TypeUp({ children }: { children: ReactNode }) {
  return <div className="type-up contents">{children}</div>;
}
