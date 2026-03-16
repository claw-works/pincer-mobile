import React, { createContext, useContext, useState, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Lang, strings } from './index';

interface LangContextValue {
  lang: Lang;
  t: typeof strings.zh;
  toggleLang: () => void;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: 'zh', t: strings.zh, toggleLang: () => {}, setLang: () => {},
});

/** Detect device locale and return 'zh' or 'en' */
function detectSystemLang(): Lang {
  try {
    const locale: string =
      Platform.OS === 'ios'
        ? (NativeModules.SettingsManager?.settings?.AppleLocale ||
           NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
           'zh')
        : (NativeModules.I18nManager?.localeIdentifier ||
           NativeModules.RNLocalize?.languages?.[0] ||
           'zh');
    return locale.startsWith('zh') ? 'zh' : 'en';
  } catch {
    return 'zh';
  }
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectSystemLang);

  useEffect(() => {
    // Override with user preference if set
    AsyncStorage.getItem('pincerLang').then(l => {
      if (l === 'zh' || l === 'en') setLangState(l);
    });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem('pincerLang', l).catch(() => {});
  };

  const toggleLang = () => setLang(lang === 'zh' ? 'en' : 'zh');

  return (
    <LangContext.Provider value={{ lang, t: strings[lang] as typeof strings.zh, toggleLang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
