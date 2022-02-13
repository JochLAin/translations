"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = exports.mergeCatalogs = exports.Translator = void 0;
const format_1 = __importDefault(require("./format"));
const contants_1 = require("./contants");
class Translator {
    constructor(translations) {
        this.fallbackDomain = contants_1.DEFAULT_DOMAIN;
        this.fallbackLocale = contants_1.DEFAULT_LOCALE;
        this.formatter = { format: format_1.default };
        this.getCatalog = (domain, locale) => {
            const catalog = this.translations.get(Translator.getKey(domain, locale));
            if (catalog)
                return catalog;
            return this.translations.get(Translator.getKey(domain, locale.split('_')[0]));
        };
        this.getMessage = (key, domain, locale) => {
            const getValue = (catalog, ...keys) => {
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
                        return getValue(catalog[currentKey], ...keys);
                }
                return '';
            };
            return getValue(this.getCatalog(domain, locale), ...key.split('.'));
        };
        this.addCatalog = (catalog, domain = contants_1.DEFAULT_DOMAIN, locale = this.fallbackLocale) => {
            this.translations.set(Translator.getKey(domain, locale), Translator.mergeCatalogs(this.getCatalog(domain, locale), catalog));
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
exports.default = Translator.create;
exports.mergeCatalogs = Translator.mergeCatalogs;
exports.translate = Translator.translate;
//# sourceMappingURL=index.js.map