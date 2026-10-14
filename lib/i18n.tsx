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
    "nav.completedProjects": "Completed Projects",
    "nav.about": "About Us",
    "nav.contact": "Contact",
    "nav.consultation": "Book a Consultation",
    "nav.themeToDark": "Switch to dark mode",
    "nav.themeToLight": "Switch to light mode",
    "a11y.pause": "Pause",
    "a11y.play": "Play",
    "quotes.eyebrow": "WORDS FROM OUR RESIDENTS",
    "quotes.by": "{name} · RESIDENT AT {project}",
    "quotes.indicator": "Quote {n}",
    "opening.back": "← ALL PROJECTS",
    "opening.sound": "SOUND",
    "opening.soundOn": "Turn sound on",
    "opening.soundOff": "Turn sound off",
    "opening.scroll": "SCROLL ↓",
    "about.eyebrow": "ABOUT THE PROJECT",
  },
  mk: {
    "nav.home": "Почетна",
    "nav.projects": "Проекти",
    "nav.completedProjects": "Завршени проекти",
    "nav.about": "За нас",
    "nav.contact": "Контакт",
    "nav.consultation": "Закажи консултација",
    "nav.themeToDark": "Вклучи темен режим",
    "nav.themeToLight": "Вклучи светол режим",
    "a11y.pause": "Пауза",
    "a11y.play": "Пушти",
    "quotes.eyebrow": "ЗБОРОВИ НА НАШИТЕ СТАНАРИ",
    "quotes.by": "{name} · СТАНАР ВО {project}",
    "quotes.indicator": "Цитат {n}",
    "opening.back": "← СИТЕ ПРОЕКТИ",
    "opening.sound": "ЗВУК",
    "opening.soundOn": "Вклучи звук",
    "opening.soundOff": "Исклучи звук",
    "opening.scroll": "СКРОЛАЈ ↓",
    "about.eyebrow": "ЗА ПРОЕКТОТ",
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
