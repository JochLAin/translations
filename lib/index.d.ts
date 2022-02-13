import { CatalogType, FormatterType, OptionsType, ReplacementType, TranslationType } from "./types";
export declare class Translator {
    static create(translations: TranslationType, options?: OptionsType): Translator;
    static getKey(domain: string, locale: string): string;
    static mergeCatalogs(target?: CatalogType, ...sources: CatalogType[]): CatalogType;
    static translate(catalog: {
        [locale: string]: string;
    }, replacements?: ReplacementType, locale?: string, formatter?: FormatterType): string;
    fallbackDomain: string;
    fallbackLocale: string;
    formatter: FormatterType;
    translations: Map<string, CatalogType>;
    constructor(translations?: Map<string, CatalogType>);
    getCatalog: (domain: string, locale: string) => CatalogType | undefined;
    getMessage: (key: string, domain: string, locale: string) => string;
    addCatalog: (catalog: CatalogType, domain?: string, locale?: string) => this;
    translate: (key: string, replacements?: ReplacementType | undefined, domain?: string | undefined, locale?: string | undefined) => string;
    setFallbackDomain: (domain?: string) => this;
    setFallbackLocale: (locale?: string) => this;
    setFormatter: (formatter?: FormatterType | undefined) => this;
    setTranslations: (translations: TranslationType) => this;
    withDomain: (domain: string) => Translator;
    withFormatter: (formatter: FormatterType) => Translator;
    withLocale: (locale: string) => Translator;
    with: (options: OptionsType) => Translator;
}
declare const _default: typeof Translator.create;
export default _default;
export declare const mergeCatalogs: typeof Translator.mergeCatalogs;
export declare const translate: typeof Translator.translate;
