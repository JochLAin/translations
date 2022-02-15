"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitCatalog = exports.merge = exports.create = exports.getCatalogValue = exports.translate = exports.mergeCatalogs = exports.createTranslator = exports.Translator = void 0;
const contants_1 = require("./contants");
const format_1 = __importDefault(require("./format"));
class Translator {
    constructor(translations) {
        this.fallbackDomain = contants_1.DEFAULT_DOMAIN;
        this.fallbackLocale = contants_1.DEFAULT_LOCALE;
        this.formatter = { format: format_1.default };
        this.addCatalog = (catalog, domain = contants_1.DEFAULT_DOMAIN, locale = this.fallbackLocale) => {
            const key = Translator.getKey(domain, locale);
            const value = Translator.mergeCatalogs(this.getCatalog(domain, locale), catalog);
            this.translations.set(key, value);
            return this;
        };
        this.getCatalog = (domain, locale) => {
            const catalog = this.translations.get(Translator.getKey(domain, locale));
            if (catalog)
                return catalog;
            return this.translations.get(Translator.getKey(domain, locale.split('_')[0]));
        };
        this.getMessage = (key, domain, locale) => {
            return Translator.getCatalogValue(this.getCatalog(domain, locale), key);
        };
        this.setFallbackDomain = (domain = contants_1.DEFAULT_DOMAIN) => {
            this.fallbackDomain = domain;
            return this;
        };
        this.setFallbackLocale = (locale = contants_1.DEFAULT_LOCALE) => {
            this.fallbackLocale = locale;
            return this;
        };
        this.setFormatter = (formatter) => {
            if (formatter) {
                this.formatter = formatter;
            }
            else {
                this.formatter = { format: format_1.default };
            }
            return this;
        };
        this.setTranslations = (translations) => {
            Object.entries(translations).forEach(([locale, domains]) => {
                Object.entries(domains).forEach(([domain, messages]) => {
                    this.addCatalog(messages, domain, locale);
                });
            });
            return this;
        };
        this.translate = (key, replacements, domain, locale) => {
            if (!replacements)
                replacements = {};
            if (!domain)
                domain = this.fallbackDomain;
            if (!locale)
                locale = this.fallbackLocale;
            const message = this.getMessage(key, domain, locale);
            if (!message)
                return key;
            if (!replacements)
                replacements = {};
            return this.formatter.format(message, replacements, locale);
        };
        this.withDomain = (domain) => {
            return (new Translator(this.translations))
                .setFallbackDomain(domain)
                .setFallbackLocale(this.fallbackLocale)
                .setFormatter(this.formatter);
        };
        this.withFormatter = (formatter) => {
            return (new Translator(this.translations))
                .setFallbackDomain(this.fallbackDomain)
                .setFallbackLocale(this.fallbackLocale)
                .setFormatter(formatter);
        };
        this.withLocale = (locale) => {
            return (new Translator(this.translations))
                .setFallbackDomain(this.fallbackDomain)
                .setFallbackLocale(locale)
                .setFormatter(this.formatter);
        };
        this.with = (options) => {
            return (new Translator(this.translations))
                .setFallbackDomain(options.domain || this.fallbackDomain)
                .setFallbackLocale(options.locale || this.fallbackLocale)
                .setFormatter(options.formatter || this.formatter);
        };
        this.translations = translations || new Map();
        return new Proxy(this, {
            get(target, property, receiver) {
                if (typeof property === 'string') {
                    if (['fallbackDomain', 'fallbackLocale', 'formatter'].includes(property)) {
                        return Reflect.get(target, `_${property}`, receiver);
                    }
                    if ('translations' === property) {
                        return [...target.translations.entries()].reduce((accu, [key, catalog]) => {
                            const [domain, locale] = key.split('-');
                            if (!accu[locale])
                                accu[locale] = {};
                            accu[locale][domain] = catalog;
                            return accu;
                        }, {});
                    }
                }
                return Reflect.get(target, property, receiver);
            },
            set(target, property, value, receiver) {
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
    static create(translations, options = {}) {
        const { domain = contants_1.DEFAULT_DOMAIN, locale = contants_1.DEFAULT_LOCALE, formatter } = options;
        return (new Translator())
            .setFallbackDomain(domain)
            .setFallbackLocale(locale)
            .setFormatter(formatter)
            .setTranslations(translations);
    }
    static getKey(domain, locale) {
        return `${domain.toLowerCase()}-${locale.toLowerCase()}`;
    }
    static mergeCatalogs(target, ...sources) {
        if (!target)
            target = {};
        if (!sources.length)
            return target;
        const source = sources.shift();
        if (typeof source === 'object') {
            for (let keys = Object.keys(source), idx = 0; idx < keys.length; idx++) {
                const key = keys[idx];
                if (typeof source[key] === 'string') {
                    Object.assign(target, { [key]: source[key] });
                }
                else {
                    if (!target[key])
                        target[key] = {};
                    if (typeof target[key] === 'string')
                        target[key] = {};
                    Object.assign(target[key], Translator.mergeCatalogs(target[key], source[key]));
                }
            }
        }
        return Translator.mergeCatalogs(target, ...sources);
    }
    ;
    static translate(catalog, replacements, locale = contants_1.DEFAULT_LOCALE, formatter = { format: format_1.default }) {
        const message = catalog[locale] || catalog[locale.split('_')[0]] || '';
        if (!message)
            return '';
        if (!replacements)
            replacements = {};
        return formatter.format(message, replacements, locale);
    }
}
exports.Translator = Translator;
Translator.getCatalogValue = (catalog, key) => {
    const closure = (catalog, ...keys) => {
        if (!catalog)
            return key;
        if (typeof catalog === 'string')
            return catalog;
        let currentKey = '';
        while (keys.length) {
            const shifted = keys.shift() || '';
            if (!currentKey)
                currentKey = shifted;
            else
                currentKey += `.${shifted}`;
            const value = catalog[currentKey];
            if (value)
                return closure(catalog[currentKey], ...keys);
        }
        return key;
    };
    return closure(catalog, ...key.split('.'));
};
exports.default = new Proxy(Translator, {
    apply(target, thisArg, args) {
        return Translator.create(...args);
    },
    construct(target, args) {
        return new Translator(...args);
    },
    set() {
        throw new Error('It\'s not allowed to add a property to Translator class, please use a composition relation instead.');
    }
});
exports.createTranslator = Translator.create;
exports.mergeCatalogs = Translator.mergeCatalogs;
exports.translate = Translator.translate;
exports.getCatalogValue = Translator.getCatalogValue;
exports.create = Translator.create;
exports.merge = Translator.mergeCatalogs;
exports.visitCatalog = Translator.getCatalogValue;
//# sourceMappingURL=index.js.map