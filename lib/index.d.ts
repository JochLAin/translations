import { DEFAULT_DOMAIN, DEFAULT_LOCALE } from "./constants";
import format from "./format";
export declare type FormatType = (message: string, replacements: ReplacementType, locale: string) => string;
export declare type FormatterType = {
    format: FormatType;
};
export declare type CatalogType = {
    [key: string]: CatalogType | string;
};
export declare type DomainType = {
    [domain: string]: CatalogType;
};
export declare type ReplacementType = {
    [key: string]: any;
};
export declare type TranslationType = {
    [locale: string]: DomainType;
};
export declare type OptionsType = {
    locale?: string;
    domain?: string;
    formatter?: FormatterType;
};
declare class Translator {
    static create(translations?: TranslationType, options?: OptionsType): Translator;
    static getMapKey(domain: string, locale: string): string;
    static getKey(domain: string, locale: string): string;
    static getCatalogValue: (catalog: CatalogType | undefined, key: string) => string;
    static mergeCatalogs(target?: CatalogType, ...sources: CatalogType[]): CatalogType;
    static parseMapKey(key: string): [string, string];
    static translate(catalog?: {
        [locale: string]: string;
    }, replacements?: ReplacementType, locale?: string, formatter?: FormatterType): string;
    catalogs: Map<string, CatalogType>;
    fallbackDomain: string;
    fallbackLocale: string;
    formatter: FormatterType;
    constructor(catalogs?: Map<string, CatalogType>);
    addCatalog: (catalog?: CatalogType, domain?: string, locale?: string) => Translator;
    getCatalog: (domain?: string, locale?: string) => CatalogType | undefined;
    getDomains: () => string[];
    getLocales: () => string[];
    getMessage: (key: string, domain?: string, locale?: string) => string;
    getMessages: (key: string, domain?: string) => {
        [locale: string]: string;
    };
    setFallbackDomain: (domain?: string) => Translator;
    setFallbackLocale: (locale?: string) => Translator;
    setFormatter: (formatter?: FormatterType | undefined) => Translator;
    setTranslations: (catalogs: TranslationType) => Translator;
    translate: (key: string, replacements?: ReplacementType | undefined, domain?: string | undefined, locale?: string | undefined) => string;
    withDomain: (domain: string) => Translator;
    withFormatter: (formatter: FormatterType) => Translator;
    withLocale: (locale: string) => Translator;
    with: (options: OptionsType) => Translator;
}
declare const proxy: typeof Translator;
export default proxy;
export { DEFAULT_DOMAIN, DEFAULT_LOCALE };
export { proxy as Translator };
export declare const createTranslator: typeof Translator.create;
export declare const formatMessage: typeof format;
export declare const getCatalogValue: (catalog: CatalogType | undefined, key: string) => string;
export declare const mergeCatalogs: typeof Translator.mergeCatalogs;
export declare const translate: typeof Translator.translate;
export declare const create: typeof Translator.create;
export declare const merge: typeof Translator.mergeCatalogs;
export declare const visitCatalog: (catalog: CatalogType | undefined, key: string) => string;
