"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { messagesByLocale } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/types";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("vi");

  useEffect(() => {
    const stored = window.localStorage.getItem("tailflash-locale");
    if (stored === "vi" || stored === "en") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocale(stored);
      return;
    }

    setLocale(navigator.language.toLowerCase().startsWith("en") ? "en" : "vi");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tailflash-locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      locale,
      setLocale,
      t: (key: string, fallback?: string) =>
        messagesByLocale[locale][key] ?? fallback ?? key,
    };
  }, [locale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
