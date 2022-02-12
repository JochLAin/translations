var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import format from "./format";
import { DEFAULT_DOMAIN, DEFAULT_LOCALE } from "./contants";
var Translator = (function () {
    function Translator(translations) {
        var _this = this;
        this.fallbackDomain = DEFAULT_DOMAIN;
        this.fallbackLocale = DEFAULT_LOCALE;
        this.formatter = { format: format };
        this.getCatalog = function (domain, locale) {
            var catalog = _this.translations.get(Translator.getKey(domain, locale));
            if (catalog)
                return catalog;
            return _this.translations.get(Translator.getKey(domain, locale.split('_')[0]));
        };
        this.getMessage = function (key, domain, locale) {
            var getValue = function (catalog) {
                var keys = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    keys[_i - 1] = arguments[_i];
                }
                if (!catalog)
                    return key;
                if (typeof catalog === 'string')
                    return catalog;
                var currentKey = '';
                while (keys.length) {
                    var shifted = keys.shift() || '';
                    if (!currentKey)
                        currentKey = shifted;
                    else
                        currentKey += ".".concat(shifted);
                    var value = catalog[currentKey];
                    if (value)
                        return getValue.apply(void 0, __spreadArray([catalog[currentKey]], keys, false));
                }
                return '';
            };
            return getValue.apply(void 0, __spreadArray([_this.getCatalog(domain, locale)], key.split('.'), false));
        };
        this.addCatalog = function (messages, domain, locale) {
            if (domain === void 0) { domain = DEFAULT_DOMAIN; }
            if (locale === void 0) { locale = _this.fallbackLocale; }
            _this.translations.set(Translator.getKey(domain, locale), __assign(__assign({}, _this.getCatalog(domain, locale)), messages));
            return _this;
        };
        this.translate = function (key, replacements, domain, locale) {
            if (!replacements)
                replacements = {};
            if (!domain)
                domain = _this.fallbackDomain;
            if (!locale)
                locale = _this.fallbackLocale;
            var message = _this.getMessage(key, domain, locale);
            if (!message)
                return key;
            if (!replacements)
                replacements = {};
            return _this.formatter.format(message, replacements, locale);
        };
        this.setFallbackDomain = function (domain) {
            if (domain === void 0) { domain = DEFAULT_DOMAIN; }
            _this.fallbackDomain = domain;
            return _this;
        };
        this.setFallbackLocale = function (locale) {
            if (locale === void 0) { locale = DEFAULT_LOCALE; }
            _this.fallbackLocale = locale;
            return _this;
        };
        this.setFormatter = function (formatter) {
            if (formatter) {
                _this.formatter = formatter;
            }
            else {
                _this.formatter = { format: format };
            }
            return _this;
        };
        this.setTranslations = function (translations) {
            Object.entries(translations).forEach(function (_a) {
                var locale = _a[0], domains = _a[1];
                Object.entries(domains).forEach(function (_a) {
                    var domain = _a[0], messages = _a[1];
                    _this.addCatalog(messages, domain, locale);
                });
            });
            return _this;
        };
        this.withDomain = function (domain) {
            return (new Translator(_this.translations))
                .setFallbackDomain(domain)
                .setFallbackLocale(_this.fallbackLocale)
                .setFormatter(_this.formatter);
        };
        this.withFormatter = function (formatter) {
            return (new Translator(_this.translations))
                .setFallbackDomain(_this.fallbackDomain)
                .setFallbackLocale(_this.fallbackLocale)
                .setFormatter(formatter);
        };
        this.withLocale = function (locale) {
            return (new Translator(_this.translations))
                .setFallbackDomain(_this.fallbackDomain)
                .setFallbackLocale(locale)
                .setFormatter(_this.formatter);
        };
        this.with = function (options) {
            return (new Translator(_this.translations))
                .setFallbackDomain(options.domain || _this.fallbackDomain)
                .setFallbackLocale(options.locale || _this.fallbackLocale)
                .setFormatter(options.formatter || _this.formatter);
        };
        this.translations = translations || new Map();
    }
    Translator.create = function (translations, options) {
        if (options === void 0) { options = {}; }
        var _a = options.domain, domain = _a === void 0 ? DEFAULT_DOMAIN : _a, _b = options.locale, locale = _b === void 0 ? DEFAULT_LOCALE : _b, formatter = options.formatter;
        return (new Translator())
            .setFallbackDomain(domain)
            .setFallbackLocale(locale)
            .setFormatter(formatter)
            .setTranslations(translations);
    };
    Translator.getKey = function (domain, locale) {
        return "".concat(domain.toLowerCase(), "-").concat(locale.toLowerCase());
    };
    Translator.translate = function (catalog, replacements, locale, formatter) {
        if (locale === void 0) { locale = DEFAULT_LOCALE; }
        if (formatter === void 0) { formatter = { format: format }; }
        var message = catalog[locale] || catalog[locale.split('_')[0]] || '';
        if (!message)
            return '';
        if (!replacements)
            replacements = {};
        return formatter.format(message, replacements, locale);
    };
    return Translator;
}());
export default Translator;
export var create = Translator.create;
export var translate = Translator.translate;
//# sourceMappingURL=model.js.map