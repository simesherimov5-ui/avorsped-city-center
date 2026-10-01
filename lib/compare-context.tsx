"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

const MAX_COMPARE = 3;

interface CompareContextValue {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  const value = useMemo<CompareContextValue>(
    () => ({
      ids,
      isFull: ids.length >= MAX_COMPARE,
      toggle: (id: string) =>
        setIds((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX_COMPARE ? prev : [...prev, id]
        ),
      clear: () => setIds([]),
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
