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
export declare const DEFAULT_DOMAIN = "messages";
export declare const DEFAULT_LOCALE = "en";
export declare function format(message: string, replacements: {
    [key: string]: number | string;
}, locale?: string): string;
declare class Translator {
    static create(translations?: TranslationType, options?: OptionsType): Translator;
    static getMapKey(domain: string, locale: string): string;
    static getCatalogValue: (catalog: CatalogType | undefined, key: string) => string;
    static mergeCatalogs(target?: CatalogType, ...sources: CatalogType[]): CatalogType;
    static parseMapKey(key: string): [string, string];
    static translate(catalog?: {
        [locale: string]: string;
    }, replacements?: ReplacementType, locale?: string, formatter?: FormatterType): string;
    _catalogs: Map<string, CatalogType>;
    _fallbackDomain: string;
    _fallbackLocale: string;
    _formatter: FormatterType;
    constructor(catalogs?: Map<string, CatalogType>, options?: OptionsType);
    addCatalog: (catalog?: CatalogType, domain?: string, locale?: string) => Translator;
    getCatalog: (domain?: string, locale?: string) => CatalogType | undefined;
    getDomainCatalogs: (domain?: string) => {
        [locale: string]: CatalogType;
    };
    getDomains: () => string[];
    getLocaleCatalogs: (locale?: string) => {
        [domain: string]: CatalogType;
    };
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
    get catalogs(): Map<string, CatalogType>;
    set fallbackDomain(fallbackDomain: string);
    get fallbackDomain(): string;
    get domain(): string;
    set fallbackLocale(fallbackLocale: string);
    get fallbackLocale(): string;
    get locale(): string;
    set formatter(formatter: FormatterType);
    get formatter(): FormatterType;
    get translations(): TranslationType;
}
declare const proxy: typeof Translator;
export default proxy;
export { proxy as Translator };
export declare const createTranslator: typeof Translator.create;
export declare const formatMessage: typeof format;
export declare const getCatalogValue: (catalog: CatalogType | undefined, key: string) => string;
export declare const mergeCatalogs: typeof Translator.mergeCatalogs;
export declare const translate: typeof Translator.translate;
