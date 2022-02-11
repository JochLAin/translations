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
    [key: string]: string | number;
};
export declare type TranslationType = {
    [locale: string]: DomainType;
};
export declare type OptionsType = {
    locale?: string;
    domain?: string;
    formatter?: FormatterType;
};
