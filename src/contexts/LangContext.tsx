import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translate, type TKey } from '@/i18n/translations';
import type { Lang } from '@/i18n/types';

export type { Lang };

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

function readLangFromUrl(): Lang | null {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search).get('lang');
  return q === 'uz' || q === 'ru' || q === 'en' ? q : null;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const fromUrl = readLangFromUrl();
    if (fromUrl) return fromUrl;
    const stored = localStorage.getItem('lang');
    return stored === 'ru' || stored === 'en' || stored === 'uz' ? stored : 'uz';
  });

  const changeLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('lang', l);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', l);
      window.history.replaceState({}, '', url);
    }
  };

  useEffect(() => {
    const fromUrl = readLangFromUrl();
    if (fromUrl && fromUrl !== lang) {
      setLang(fromUrl);
      localStorage.setItem('lang', fromUrl);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.documentElement.lang = lang === 'uz' ? 'uz' : lang === 'ru' ? 'ru' : 'en';
  }, [lang]);

  const t = (key: TKey, vars?: Record<string, string | number>): string =>
    translate(lang, key, vars);

  return (
    <LangContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
