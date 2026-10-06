"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { MAX_COMPARE, parseIds, readStored, subscribe, writeStored } from "@/lib/compare-store";

interface CompareContextValue {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
  /** Replaces the whole selection (a shared /compare?ids=… link). */
  set: (ids: string[]) => void;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  // The server has no selection; the browser reads it from localStorage after hydration.
  const stored = useSyncExternalStore(subscribe, readStored, () => "");
  const ids = useMemo(() => parseIds(stored), [stored]);

  const value = useMemo<CompareContextValue>(
    () => ({
      ids,
      isFull: ids.length >= MAX_COMPARE,
      toggle: (id: string) => {
        const current = parseIds(readStored());
        writeStored(
          current.includes(id)
            ? current.filter((x) => x !== id)
            : current.length >= MAX_COMPARE
              ? current
              : [...current, id]
        );
      },
      clear: () => writeStored([]),
      set: (next: string[]) => writeStored(parseIds(next.join(","))),
    }),
    [ids]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
