import { DEFAULT_DOMAIN, DEFAULT_LOCALE } from "./constants";
import format from "./format";

export type FormatType = (message: string, replacements: ReplacementType, locale: string) => string;
export type FormatterType = { format: FormatType };

export type CatalogType = { [key: string]: CatalogType|string };
export type DomainType = { [domain: string]: CatalogType };
export type ReplacementType = { [key: string]: any };
export type TranslationType = { [locale: string]: DomainType };

export type OptionsType = {
    locale?: string,
    domain?: string,
    formatter?: FormatterType,
};

const KEY_SEPARATOR = '-';

class Translator {
    static create(translations: TranslationType = {}, options: OptionsType = {}): Translator {
        const { domain = DEFAULT_DOMAIN, locale = DEFAULT_LOCALE, formatter } = options;

        return (new Translator())
            .setFallbackDomain(domain)
            .setFallbackLocale(locale)
            .setFormatter(formatter)
            .setTranslations(translations)
        ;
    }

    static getMapKey(domain: string, locale: string): string {
        return `${domain.toLowerCase()}${KEY_SEPARATOR}${locale.toLowerCase()}`;
    }

    /** @deprecated use getMapKey instead */
    static getKey(domain: string, locale: string): string {
        return Translator.getMapKey(domain, locale);
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

    static parseMapKey(key: string): [string, string] {
        const [domain, locale] = key.split(KEY_SEPARATOR);
        return [domain, locale];
    }

    static translate(catalog: { [locale: string]: string } = {}, replacements: ReplacementType = {}, locale: string = DEFAULT_LOCALE, formatter: FormatterType = { format }): string {
        const message = catalog[locale] || catalog[locale.split('_')[0]] || '';
        if (!message) return ''
        if (!replacements) replacements = {};
        return formatter.format(message, replacements, locale);
    }

    _catalogs: Map<string, CatalogType>;
    _fallbackDomain: string = DEFAULT_DOMAIN;
    _fallbackLocale: string = DEFAULT_LOCALE;
    _formatter: FormatterType = { format };

    constructor(catalogs?: Map<string, CatalogType>, options: OptionsType = {}) {
        const { domain = DEFAULT_DOMAIN, locale = DEFAULT_LOCALE, formatter } = options;

        this._catalogs = catalogs || new Map<string, CatalogType>();
        this
            .setFallbackDomain(domain)
            .setFallbackLocale(locale)
            .setFormatter(formatter)
        ;
    }

    addCatalog = (catalog: CatalogType = {}, domain: string = this._fallbackDomain, locale: string = this._fallbackLocale): Translator => {
        const key = Translator.getMapKey(domain, locale);
        const value = Translator.mergeCatalogs(this.getCatalog(domain, locale), catalog);
        this._catalogs.set(key, value);

        return this;
    };

    getCatalog = (domain: string = this._fallbackDomain, locale: string = this._fallbackLocale): CatalogType|undefined => {
        const catalog = this._catalogs.get(Translator.getMapKey(domain, locale));
        if (catalog) return catalog;
        if (domain.includes('_')) {
            return this._catalogs.get(Translator.getMapKey(domain, locale.split('_')[0]));
        }
        return undefined;
    };

    getDomainCatalogs = (domain: string = this._fallbackDomain): { [locale: string]: CatalogType } => {
        return this.getLocales().reduce((accu, locale) => {
            return { ...accu, [locale]: this.getCatalog(domain, locale) };
        }, {});
    };

    getDomains = (): string[] => {
        return Array.from(this._catalogs.keys())
            .map((key: string) => Translator.parseMapKey(key)[0])
            .filter((key, idx, keys) => keys.indexOf(key) === idx)
        ;
    };

    getLocaleCatalogs = (locale: string = this._fallbackLocale): { [domain: string]: CatalogType } => {
        return this.getDomains().reduce((accu, domain) => {
            return { ...accu, [domain]: this.getCatalog(domain, locale) };
        }, {});
    };

    getLocales = (): string[] => {
        return Array.from(this._catalogs.keys())
            .map((key: string) => Translator.parseMapKey(key)[1])
            .filter((key, idx, keys) => keys.indexOf(key) === idx)
        ;
    };

    getMessage = (key: string, domain: string = this._fallbackDomain, locale: string = this._fallbackLocale): string => {
        return Translator.getCatalogValue(this.getCatalog(domain, locale), key);
    };

    getMessages = (key: string, domain: string = this._fallbackDomain): { [locale: string]: string } => {
        return this.getLocales().reduce((accu, locale) => {
            return { ...accu, [locale]: this.getMessage(key, domain, locale) };
        }, {});
    };

    setFallbackDomain = (domain: string = DEFAULT_DOMAIN): Translator => {
        this._fallbackDomain = domain;
        return this;
    };

    setFallbackLocale = (locale: string = DEFAULT_LOCALE): Translator => {
        this._fallbackLocale = locale;
        return this;
    };

    setFormatter = (formatter?: FormatterType): Translator => {
        if (formatter) {
            this._formatter = formatter;
        } else {
            this._formatter = { format };
        }
        return this;
    };

    setTranslations = (catalogs: TranslationType): Translator => {
        Object.entries(catalogs).forEach(([locale, domains]) => {
            Object.entries(domains).forEach(([domain, messages]) => {
                this.addCatalog(messages, domain, locale);
            });
        });
        return this;
    };

    translate = (key: string, replacements?: ReplacementType, domain?: string, locale?: string): string => {
        if (!replacements) replacements = {};
        if (!domain) domain = this._fallbackDomain;
        if (!locale) locale = this._fallbackLocale;

        const message = this.getMessage(key, domain, locale);
        if (!message) return key;
        if (!replacements) replacements = {};
        return this._formatter.format(message, replacements, locale);
    };

    withDomain = (domain: string): Translator => {
        return (new Translator(this._catalogs))
            .setFallbackDomain(domain)
            .setFallbackLocale(this._fallbackLocale)
            .setFormatter(this._formatter)
        ;
    };

    withFormatter = (formatter: FormatterType): Translator => {
        return (new Translator(this._catalogs))
            .setFallbackDomain(this._fallbackDomain)
            .setFallbackLocale(this._fallbackLocale)
            .setFormatter(formatter)
        ;
    };

    withLocale = (locale: string): Translator => {
        return (new Translator(this._catalogs))
            .setFallbackDomain(this._fallbackDomain)
            .setFallbackLocale(locale)
            .setFormatter(this._formatter)
        ;
    };

    with = (options: OptionsType) => {
        return (new Translator(this._catalogs))
            .setFallbackDomain(options.domain || this._fallbackDomain)
            .setFallbackLocale(options.locale || this._fallbackLocale)
            .setFormatter(options.formatter || this._formatter)
        ;
    };

    get catalogs(): Map<string, CatalogType> {
        return this._catalogs;
    }

    set fallbackDomain(fallbackDomain: string) {
        this.setFallbackDomain(fallbackDomain);
    }

    get fallbackDomain(): string {
        return this._fallbackDomain;
    }

    get domain(): string {
        return this.fallbackDomain;
    }

    set fallbackLocale(fallbackLocale: string) {
        this.setFallbackLocale(fallbackLocale);
    }

    get fallbackLocale(): string {
        return this._fallbackLocale;
    }

    get locale(): string {
        return this.fallbackLocale;
    }

    set formatter(formatter: FormatterType) {
        this.setFormatter(formatter);
    }

    get formatter(): FormatterType {
        return this._formatter;
    }

    get translations(): TranslationType {
        return Array.from(this._catalogs.entries()).reduce((accu: TranslationType, [key, catalog]) => {
            const [domain, locale] = Translator.parseMapKey(key);
            if (!accu[locale]) accu[locale] = {};
            accu[locale][domain] = catalog;

            return accu;
        }, {});
    }
}

const proxy = new Proxy(Translator, {
    apply(target: typeof Translator, thisArg: any, args: [TranslationType, OptionsType]): Translator {
        return Translator.create(...args);
    },
    construct(target: typeof Translator, args: any[]): Translator {
        return new Translator(...args);
    },
    set(): boolean {
        throw new Error('It\'s not allowed to add a property to Translator class, please use a composition relation instead.');
    }
});

export default proxy;
export { DEFAULT_DOMAIN, DEFAULT_LOCALE };
export { proxy as Translator };
export const createTranslator = Translator.create;
export const formatMessage = format;
export const getCatalogValue = Translator.getCatalogValue;
export const mergeCatalogs = Translator.mergeCatalogs;
export const translate = Translator.translate;

/** @deprecated use createTranslator instead */
export const create = Translator.create;

/** @deprecated use mergeCatalogs instead */
export const merge = Translator.mergeCatalogs;

/** @deprecated use getCatalogValue instead */
export const visitCatalog = Translator.getCatalogValue;
