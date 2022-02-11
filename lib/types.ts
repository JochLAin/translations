export type FormatType = (message: string, replacements: ReplacementType, locale: string) => string;
export type FormatterType = { format: FormatType };

export type CatalogType = { [key: string]: CatalogType|string };
export type DomainType = { [domain: string]: CatalogType };
export type ReplacementType = { [key: string]: string|number };
export type TranslationType = { [locale: string]: DomainType };

export type OptionsType = {
    locale?: string,
    domain?: string,
    formatter?: FormatterType,
};
