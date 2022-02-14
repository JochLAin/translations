import { DEFAULT_DOMAIN, DEFAULT_LOCALE } from "./contants";
import format from "./format";
import { CatalogType, FormatterType, OptionsType, ReplacementType, TranslationType } from "./types";

export class Translator {
    static create(translations: TranslationType, options: OptionsType = {}): Translator {
        const { domain = DEFAULT_DOMAIN, locale = DEFAULT_LOCALE, formatter } = options;

        return (new Translator())
            .setFallbackDomain(domain)
            .setFallbackLocale(locale)
            .setFormatter(formatter)
            .setTranslations(translations)
        ;
    }

    static getKey(domain: string, locale: string): string {
        return `${domain.toLowerCase()}-${locale.toLowerCase()}`;
    }

    static getCatalogValue = (catalog: CatalogType|undefined, key: string): string => {
        const closure = (catalog: CatalogType|string|undefined, ...keys: string[]): string => {
            if (!catalog) return key;
            if (typeof catalog === 'string') return catalog;
            let currentKey = '';
            while (keys.length) {
                const shifted = keys.shift() || ''; // For point end sentence
                if (!currentKey) currentKey = shifted;
                else currentKey += `.${shifted}`;
                const value = catalog[currentKey];
                if (value) return closure(catalog[currentKey], ...keys);
            }
            return key;
        };
        return closure(catalog, ...key.split('.'));
    };

    static mergeCatalogs(target?: CatalogType, ...sources: CatalogType[]): CatalogType {
        if (!target) target = {};
        if (!sources.length) return target;
        const source = sources.shift();
        if (typeof source === 'object') {
            for (let keys = Object.keys(source), idx = 0; idx < keys.length; idx++) {
                const key = keys[idx];
                if (typeof source[key] === 'string') {
                    Object.assign(target, {[key]: source[key]});
                } else {
                    if (!target[key]) target[key] = {};
                    if (typeof target[key] === 'string') target[key] = {};
                    Object.assign(target[key], Translator.mergeCatalogs(target[key] as CatalogType, source[key] as CatalogType));
                }
            }
        }

        return Translator.mergeCatalogs(target, ...sources);
    };

    static translate(catalog: { [locale: string]: string }, replacements?: ReplacementType, locale: string = DEFAULT_LOCALE, formatter: FormatterType = { format }): string {
        const message = catalog[locale] || catalog[locale.split('_')[0]] || '';
        if (!message) return '';
        if (!replacements) replacements = {};
        return formatter.format(message, replacements, locale);
    }

    fallbackDomain: string = DEFAULT_DOMAIN;
    fallbackLocale: string = DEFAULT_LOCALE;
    formatter: FormatterType = { format };
    translations: Map<string, CatalogType>;

    constructor(translations?: Map<string, CatalogType>) {
        this.translations = translations || new Map<string, CatalogType>();

        return new Proxy(this, {
            get(target: Translator, property: string | symbol, receiver: any): any {
                if (typeof property === 'string') {
                    if (['fallbackDomain', 'fallbackLocale', 'formatter'].includes(property)) {
                        return Reflect.get(target, `_${property}`, receiver);
                    }
                    if ('translations' === property) {
                        return [...target.translations.entries()].reduce((accu: TranslationType, [key, catalog]) => {
                            const [domain, locale] = key.split('-');
                            if (!accu[locale]) accu[locale] = {};
                            accu[locale][domain] = catalog;

                            return accu;
                        }, {});
                    }
                }
                return Reflect.get(target, property, receiver);
            },
            set(target: Translator, property: string | symbol, value: any, receiver: any): boolean {
                if (typeof property === 'string') {
                    switch (property) {
                        case 'fallbackDomain':
                            return !!target.setFallbackDomain(value);
                        case 'fallbackLocale':
                            return !!target.setFallbackLocale(value);
                        case 'formatter':
                            return !!target.setFormatter(value);
                        case 'translations':
                            return !!target.setTranslations(value);
                    }
                }
                return Reflect.set(target, property, receiver);
            }
        });
    }

    addCatalog = (catalog: CatalogType, domain: string = DEFAULT_DOMAIN, locale: string = this.fallbackLocale): this => {
        const key = Translator.getKey(domain, locale);
        const value = Translator.mergeCatalogs(this.getCatalog(domain, locale), catalog);
        this.translations.set(key, value);

        return this;
    };

    getCatalog = (domain: string, locale: string): CatalogType|undefined => {
        const catalog = this.translations.get(Translator.getKey(domain, locale));
        if (catalog) return catalog;
        return this.translations.get(Translator.getKey(domain, locale.split('_')[0]));
    };

    getMessage = (key: string, domain: string, locale: string): string => {
        return Translator.getCatalogValue(this.getCatalog(domain, locale), key);
    };

    setFallbackDomain = (domain: string = DEFAULT_DOMAIN): this => {
        this.fallbackDomain = domain;
        return this;
    };

    setFallbackLocale = (locale: string = DEFAULT_LOCALE): this => {
        this.fallbackLocale = locale;
        return this;
    };

    setFormatter = (formatter?: FormatterType): this => {
        if (formatter) {
            this.formatter = formatter;
        } else {
            this.formatter = { format };
        }
        return this;
    };

    setTranslations = (translations: TranslationType): this => {
        Object.entries(translations).forEach(([locale, domains]) => {
            Object.entries(domains).forEach(([domain, messages]) => {
                this.addCatalog(messages, domain, locale);
            });
        });
        return this;
    };

    translate = (key: string, replacements?: ReplacementType, domain?: string, locale?: string): string => {
        if (!replacements) replacements = {};
        if (!domain) domain = this.fallbackDomain;
        if (!locale) locale = this.fallbackLocale;

        const message = this.getMessage(key, domain, locale);
        if (!message) return key;
        if (!replacements) replacements = {};
        return this.formatter.format(message, replacements, locale);
    };

    withDomain = (domain: string): Translator => {
        return (new Translator(this.translations))
            .setFallbackDomain(domain)
            .setFallbackLocale(this.fallbackLocale)
            .setFormatter(this.formatter)
        ;
    };

    withFormatter = (formatter: FormatterType): Translator => {
        return (new Translator(this.translations))
            .setFallbackDomain(this.fallbackDomain)
            .setFallbackLocale(this.fallbackLocale)
            .setFormatter(formatter)
        ;
    };

    withLocale = (locale: string): Translator => {
        return (new Translator(this.translations))
            .setFallbackDomain(this.fallbackDomain)
            .setFallbackLocale(locale)
            .setFormatter(this.formatter)
        ;
    };

    with = (options: OptionsType) => {
        return (new Translator(this.translations))
            .setFallbackDomain(options.domain || this.fallbackDomain)
            .setFallbackLocale(options.locale || this.fallbackLocale)
            .setFormatter(options.formatter || this.formatter)
        ;
    };
}

export default Translator.create;
export const mergeCatalogs = Translator.mergeCatalogs;
export const translate = Translator.translate;
export const getCatalogValue = Translator.getCatalogValue;

/** @deprecated use mergeCatalogs instead */
export const merge = Translator.mergeCatalogs;

/** @deprecated use getCatalogValue instead */
export const visitCatalog = Translator.getCatalogValue;
