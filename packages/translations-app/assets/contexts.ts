import { createElement, createContext, useContext, useEffect, useMemo, useState } from "react";

export type CatalogType = { [key: string]: CatalogType|string };
export type DomainType = { [domain: string]: CatalogType };
export type TranslationType = { [locale: string]: DomainType };
export type Settings = {
  allowFlag?: boolean,
  field?: string,
  lang?: string,
};

export type MainContextType = {
  currentDomain?: string,
  currentKey?: string,
  currentLang?: string,
  domains?: string[],
  keys?: string[],
  languages?: string[],
  settings: Settings,
  started: boolean,
  translations?: TranslationType,
  setCurrentDomain: (domain?: string) => void,
  setCurrentKey: (key?: string) => void,
  setCurrentLang: (lang?: string) => void,
  setSettings: (settings: Settings) => void,
  setSetting: (name: string, value: any) => void,
  setTranslations: (translations: TranslationType) => void,
  setTranslation: (lang: string, domain: string, key: string, value: string) => void,
  translate: (key: string) => string,
};

export const MainContext = createContext<MainContextType>({
  settings: {},
  started: false,
  setCurrentDomain: () => {},
  setCurrentKey: () => {},
  setCurrentLang: () => {},
  setSettings: () => {},
  setSetting: () => {},
  setTranslations: () => {},
  setTranslation: () => {},
  translate: (key: string) => key,
});

export function MainProvider(props: { children: any, settings?: Settings, translations?: TranslationType }) {
  const [translations, setTranslations] = useState<TranslationType|undefined>(props.translations);
  const [currentDomain, setCurrentDomain] = useState<string|undefined>();
  const [currentKey, setCurrentKey] = useState<string|undefined>();
  const [currentLang, setCurrentLang] = useState<string|undefined>();
  const [started, setStarted] = useState<boolean>(false);

  const languages = useMemo<undefined|string[]>(() => {
    if (!translations) return undefined;
    return Object.keys(translations);
  }, [translations]);

  const domains = useMemo<undefined|string[]>(() => {
    if (!translations || !languages) return undefined;
    const mergedDomains: string[] = languages.reduce((accu: string[], lang) => {
      const keys = Object.keys(translations[lang]);
      return [...accu, ...keys];
    }, []);

    return mergedDomains.filter((lang, idx, languages) => {
      return languages.indexOf(lang) === idx;
    });
  }, [translations, languages]);

  const [settings, setSettings] = useState<Settings>(props.settings || {
    allowFlag: false,
    field: 'tag',
    lang: languages?.[0],
  });

  const keys: undefined|string[] = useMemo<undefined|string[]>(() => {
    if (!currentLang || !currentDomain) return undefined;
    if (!translations) return undefined;
    return Object.keys(translations[currentLang][currentDomain]);
  }, [translations, currentLang, currentDomain]);

  useEffect(() => {
    setStarted(!!localStorage.getItem('configured'));
  }, [setStarted]);

  const store: MainContextType = {
    currentDomain,
    currentKey,
    currentLang,
    domains,
    keys,
    languages,
    settings,
    started,
    translations,
    setCurrentDomain,
    setCurrentKey,
    setCurrentLang,
    setSettings,
    setSetting(name: string, value: any) {
      setSettings({ ...settings, [name]: value });
    },
    setTranslations,
    setTranslation(lang: string, domain: string, key: string, value: string) {
      setTranslations({
        ...(translations || {}),
        [lang]: {
          ...(translations?.[lang] || {}),
          [domain]: {
            ...(translations?.[lang]?.[domain] || {}),
            [key]: value,
          }
        }
      });
    },
    translate: (key: string) => key,
  };

  return createElement(
    MainContext.Provider,
    { value: store },
    props.children
  );
}

export default function useMain(): MainContextType {
  return useContext(MainContext);
}
