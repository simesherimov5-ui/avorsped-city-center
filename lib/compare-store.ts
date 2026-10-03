// The compare selection (up to three apartments) lives in localStorage, so it survives a reload, and in the address
// (/compare?ids=a,b,c) while the compare page is open, so the link can be shared. This is the one place that reads
// and writes it; React reads it through useSyncExternalStore (see compare-context).

export const MAX_COMPARE = 3;
const KEY = "js_compare";
const listeners = new Set<() => void>();

/** "a,b,c" → ["a", "b", "c"]: trimmed, unique, at most three. */
export function parseIds(raw: string | null | undefined): string[] {
  const ids = (raw ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return [...new Set(ids)].slice(0, MAX_COMPARE);
}

export const idsToParam = (ids: string[]) => ids.join(",");

/** The stored selection as one string (a stable snapshot for useSyncExternalStore). */
export function readStored(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeStored(ids: string[]) {
  const next = ids.slice(0, MAX_COMPARE);
  try {
    localStorage.setItem(KEY, idsToParam(next));
  } catch {
    // storage blocked: the selection then lasts until the page is closed, through the listeners below
  }
  // While the compare page is open, its address follows the selection.
  if (window.location.pathname === "/compare") {
    window.history.replaceState(
      null,
      "",
      next.length ? `/compare?ids=${encodeURIComponent(idsToParam(next))}` : "/compare"
    );
  }
  listeners.forEach((l) => l());
}

export function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}
