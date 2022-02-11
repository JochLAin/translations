import { CatalogType, FormatterType, OptionsType, ReplacementType, TranslationType } from "./types";
declare class Translator {
    static create(translations: TranslationType, options?: OptionsType): Translator;
    fallbackDomain: string;
    fallbackLocale: string;
    formatter: FormatterType;
    translations: Map<string, CatalogType>;
    static getKey(domain: string, locale: string): string;
    constructor(translations?: Map<string, CatalogType>);
    getCatalog: (domain: string, locale: string) => CatalogType | undefined;
    getMessage: (key: string, domain: string, locale: string) => string;
    addCatalog: (messages: CatalogType, domain?: string, locale?: string) => this;
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
export default Translator;
export declare const create: typeof Translator.create;
