import format from "./format";
import { CatalogType, FormatterType, OptionsType, ReplacementType, TranslationType } from "./types";

const DEFAULT_DOMAIN = 'messages';
const DEFAULT_LOCALE = 'en';

class Translator {
    static create(translations: TranslationType, options: OptionsType = {}): Translator {
        const { domain = DEFAULT_DOMAIN, locale = DEFAULT_LOCALE, formatter } = options;

        return (new Translator())
            .setFallbackDomain(domain)
            .setFallbackLocale(locale)
            .setFormatter(formatter)
            .setTranslations(translations)
        ;
    };

    fallbackDomain: string = DEFAULT_DOMAIN;
    fallbackLocale: string = DEFAULT_LOCALE;
    formatter: FormatterType = { format };
    translations: Map<string, CatalogType>;

    static getKey(domain: string, locale: string): string {
        return `${domain.toLowerCase()}-${locale.toLowerCase()}`;
    }

    constructor(translations?: Map<string, CatalogType>) {
        this.translations = translations || new Map<string, CatalogType>();
    }

    getCatalog = (domain: string, locale: string): CatalogType|undefined => {
        const catalog = this.translations.get(Translator.getKey(domain, locale));
        if (catalog) return catalog;
        return this.translations.get(Translator.getKey(domain, locale.split('_')[0]));
    };

    getMessage = (key: string, domain: string, locale: string): string => {
        const getValue = (catalog: CatalogType|string|undefined, ...keys: string[]): string => {
            if (!catalog) return key;
            if (typeof catalog === 'string') return catalog;
            let currentKey = '';
            while (keys.length) {
                const shifted = keys.shift() || ''; // For point end sentence
                if (!currentKey) currentKey = shifted;
                else currentKey += `.${shifted}`;
                const value = catalog[currentKey];
                if (value) return getValue(catalog[currentKey], ...keys);
            }
            return '';
        };
        return getValue(this.getCatalog(domain, locale), ...key.split('.'));
    };

    addCatalog = (messages: CatalogType, domain: string = DEFAULT_DOMAIN, locale: string = this.fallbackLocale): this => {
        this.translations.set(Translator.getKey(domain, locale), {
            ...this.getCatalog(domain, locale),
            ...messages
        });

        return this;
    };

    translate = (key: string, replacements?: ReplacementType, domain?: string, locale?: string): string => {
        if (!replacements) replacements = {};
        if (!domain) domain = this.fallbackDomain;
        if (!locale) locale = this.fallbackLocale;

        const message = this.getMessage(key, domain, locale);
        if (!message) return key;
        return this.formatter.format(message, replacements, locale);
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

export default Translator;
export const create = Translator.create;