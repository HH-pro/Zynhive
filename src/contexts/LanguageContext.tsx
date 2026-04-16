import { createContext, useContext, useState, type ReactNode } from "react";
import { translations, type Lang, type Translations } from "../lib/i18n";

interface LanguageContextValue {
  lang:    Lang;
  setLang: (l: Lang) => void;
  t:       Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("zyn-lang");
    return saved === "sv" ? "sv" : "en";
  });

  const setLang = (l: Lang) => {
    localStorage.setItem("zyn-lang", l);
    setLangState(l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] as Translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
