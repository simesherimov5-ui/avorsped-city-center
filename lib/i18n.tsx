"use client";

// Minimal, CMS-ready multilingual scaffold: a flat key dictionary per locale.
// Add "sq" (Albanian), "sr" (Serbian) or "de" (German) here without touching any page.
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export const LOCALES = ["en", "mk"] as const;
export type Locale = (typeof LOCALES)[number];

const dictionaries: Record<Locale, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.about": "About Us",
    "nav.contact": "Contact",
    "nav.consultation": "Book a Consultation",
  },
  mk: {
    "nav.home": "Почетна",
    "nav.projects": "Проекти",
    "nav.about": "За нас",
    "nav.contact": "Контакт",
    "nav.consultation": "Закажи консултација",
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("mk");

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => dictionaries[locale][key] ?? dictionaries.en[key] ?? key,
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
