import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { LangId } from '@/game/types';
import { contents, detectDefaultLang, type GameContent } from '@/content';

interface LanguageContextValue {
  lang: LangId;
  setLang: (l: LangId) => void;
  /** 当前语言的全部内容 */
  t: GameContent;
}

const STORAGE_KEY = 'tradeoff-lang';
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'zh' || saved === 'en' ? saved : detectDefaultLang();
  });

  const setLang = (l: LangId) => setLangState(l);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: contents[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
