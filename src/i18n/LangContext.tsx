import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Lang, strings } from './index';

interface LangContextValue {
  lang: Lang;
  t: typeof strings.zh;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextValue>({
  lang: 'zh', t: strings.zh, toggleLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('zh');

  useEffect(() => {
    AsyncStorage.getItem('pincerLang').then(l => {
      if (l === 'zh' || l === 'en') setLang(l);
    });
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === 'zh' ? 'en' : 'zh';
    setLang(next);
    AsyncStorage.setItem('pincerLang', next).catch(() => {});
  };

  return (
    <LangContext.Provider value={{ lang, t: strings[lang] as typeof strings.zh, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
