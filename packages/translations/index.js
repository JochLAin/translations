"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = exports.mergeCatalogs = exports.getCatalogValue = exports.formatMessage = exports.createTranslator = exports.Translator = exports.format = exports.DEFAULT_LOCALE = exports.DEFAULT_DOMAIN = void 0;
exports.DEFAULT_DOMAIN = 'messages';
exports.DEFAULT_LOCALE = 'en';
function format(message, replacements, locale) {
    if (locale === void 0) { locale = exports.DEFAULT_LOCALE; }
    var result = message;
    for (var keys = Object.keys(replacements), idx = 0; idx < keys.length; idx++) {
        result = result.replace(new RegExp("".concat(keys[idx]), 'g'), String(replacements[keys[idx]]));
    }
    return result;
}
exports.format = format;
var KEY_SEPARATOR = '-';
var Translator = (function () {
    function Translator(catalogs, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this._fallbackDomain = exports.DEFAULT_DOMAIN;
        this._fallbackLocale = exports.DEFAULT_LOCALE;
        this._formatter = { format: format };
        this.addCatalog = function (catalog, domain, locale) {
            if (catalog === void 0) { catalog = {}; }
            if (domain === void 0) { domain = _this._fallbackDomain; }
            if (locale === void 0) { locale = _this._fallbackLocale; }
            var key = Translator.getMapKey(domain, locale);
            var value = Translator.mergeCatalogs(_this.getCatalog(domain, locale), catalog);
            _this._catalogs.set(key, value);
            return _this;
        };
        this.getCatalog = function (domain, locale) {
            if (domain === void 0) { domain = _this._fallbackDomain; }
            if (locale === void 0) { locale = _this._fallbackLocale; }
            var catalog = _this._catalogs.get(Translator.getMapKey(domain, locale));
            if (catalog)
                return catalog;
            if (domain.includes('_')) {
                return _this._catalogs.get(Translator.getMapKey(domain, locale.split('_')[0]));
            }
            return undefined;
        };
        this.getDomainCatalogs = function (domain) {
            if (domain === void 0) { domain = _this._fallbackDomain; }
            return _this.getLocales().reduce(function (accu, locale) {
                var _a;
                return __assign(__assign({}, accu), (_a = {}, _a[locale] = _this.getCatalog(domain, locale), _a));
            }, {});
        };
        this.getDomains = function () {
            return Array.from(_this._catalogs.keys())
                .map(function (key) { return Translator.parseMapKey(key)[0]; })
                .filter(function (key, idx, keys) { return keys.indexOf(key) === idx; });
        };
        this.getLocaleCatalogs = function (locale) {
            if (locale === void 0) { locale = _this._fallbackLocale; }
            return _this.getDomains().reduce(function (accu, domain) {
                var _a;
                return __assign(__assign({}, accu), (_a = {}, _a[domain] = _this.getCatalog(domain, locale), _a));
            }, {});
        };
        this.getLocales = function () {
            return Array.from(_this._catalogs.keys())
                .map(function (key) { return Translator.parseMapKey(key)[1]; })
                .filter(function (key, idx, keys) { return keys.indexOf(key) === idx; });
        };
        this.getMessage = function (key, domain, locale) {
            if (domain === void 0) { domain = _this._fallbackDomain; }
            if (locale === void 0) { locale = _this._fallbackLocale; }
            return Translator.getCatalogValue(_this.getCatalog(domain, locale), key);
        };
        this.getMessages = function (key, domain) {
            if (domain === void 0) { domain = _this._fallbackDomain; }
            return _this.getLocales().reduce(function (accu, locale) {
                var _a;
                return __assign(__assign({}, accu), (_a = {}, _a[locale] = _this.getMessage(key, domain, locale), _a));
            }, {});
        };
        this.setFallbackDomain = function (domain) {
            if (domain === void 0) { domain = exports.DEFAULT_DOMAIN; }
            _this._fallbackDomain = domain;
            return _this;
        };
        this.setFallbackLocale = function (locale) {
            if (locale === void 0) { locale = exports.DEFAULT_LOCALE; }
            _this._fallbackLocale = locale;
            return _this;
        };
        this.setFormatter = function (formatter) {
            if (formatter) {
                _this._formatter = formatter;
            }
            else {
                _this._formatter = { format: format };
            }
            return _this;
        };
        this.setTranslations = function (catalogs) {
            Object.entries(catalogs).forEach(function (_a) {
                var locale = _a[0], domains = _a[1];
                Object.entries(domains).forEach(function (_a) {
                    var domain = _a[0], messages = _a[1];
                    _this.addCatalog(messages, domain, locale);
                });
            });
            return _this;
        };
        this.translate = function (key, replacements, domain, locale) {
            if (!replacements)
                replacements = {};
            if (!domain)
                domain = _this._fallbackDomain;
            if (!locale)
                locale = _this._fallbackLocale;
            var message = _this.getMessage(key, domain, locale);
            if (!message)
                return key;
            if (!replacements)
                replacements = {};
            return _this._formatter.format(message, replacements, locale);
        };
        this.withDomain = function (domain) {
            return (new Translator(_this._catalogs))
                .setFallbackDomain(domain)
                .setFallbackLocale(_this._fallbackLocale)
                .setFormatter(_this._formatter);
        };
        this.withFormatter = function (formatter) {
            return (new Translator(_this._catalogs))
                .setFallbackDomain(_this._fallbackDomain)
                .setFallbackLocale(_this._fallbackLocale)
                .setFormatter(formatter);
        };
        this.withLocale = function (locale) {
            return (new Translator(_this._catalogs))
                .setFallbackDomain(_this._fallbackDomain)
                .setFallbackLocale(locale)
                .setFormatter(_this._formatter);
        };
        this.with = function (options) {
            return (new Translator(_this._catalogs))
                .setFallbackDomain(options.domain || _this._fallbackDomain)
                .setFallbackLocale(options.locale || _this._fallbackLocale)
                .setFormatter(options.formatter || _this._formatter);
        };
        var _a = options.domain, domain = _a === void 0 ? exports.DEFAULT_DOMAIN : _a, _b = options.locale, locale = _b === void 0 ? exports.DEFAULT_LOCALE : _b, formatter = options.formatter;
        this._catalogs = catalogs || new Map();
        this
            .setFallbackDomain(domain)
            .setFallbackLocale(locale)
            .setFormatter(formatter);
    }
    Translator.create = function (translations, options) {
        if (translations === void 0) { translations = {}; }
        if (options === void 0) { options = {}; }
        var _a = options.domain, domain = _a === void 0 ? exports.DEFAULT_DOMAIN : _a, _b = options.locale, locale = _b === void 0 ? exports.DEFAULT_LOCALE : _b, formatter = options.formatter;
        return (new Translator())
            .setFallbackDomain(domain)
            .setFallbackLocale(locale)
            .setFormatter(formatter)
            .setTranslations(translations);
    };
    Translator.getMapKey = function (domain, locale) {
        return "".concat(domain.toLowerCase()).concat(KEY_SEPARATOR).concat(locale.toLowerCase());
    };
    Translator.mergeCatalogs = function (target) {
        var _a;
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        if (!target)
            target = {};
        if (!sources.length)
            return target;
        var source = sources.shift();
        if (typeof source === 'object') {
            for (var keys = Object.keys(source), idx = 0; idx < keys.length; idx++) {
                var key = keys[idx];
                if (typeof source[key] === 'string') {
                    Object.assign(target, (_a = {}, _a[key] = source[key], _a));
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
        return Translator.mergeCatalogs.apply(Translator, __spreadArray([target], sources, false));
    };
    ;
    Translator.parseMapKey = function (key) {
        var _a = key.split(KEY_SEPARATOR), domain = _a[0], locale = _a[1];
        return [domain, locale];
    };
    Translator.translate = function (catalog, replacements, locale, formatter) {
        if (catalog === void 0) { catalog = {}; }
        if (replacements === void 0) { replacements = {}; }
        if (locale === void 0) { locale = exports.DEFAULT_LOCALE; }
        if (formatter === void 0) { formatter = { format: format }; }
        var message = catalog[locale] || catalog[locale.split('_')[0]] || '';
        if (!message)
            return '';
        if (!replacements)
            replacements = {};
        return formatter.format(message, replacements, locale);
    };
    Object.defineProperty(Translator.prototype, "catalogs", {
        get: function () {
            return this._catalogs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Translator.prototype, "fallbackDomain", {
        get: function () {
            return this._fallbackDomain;
        },
        set: function (fallbackDomain) {
            this.setFallbackDomain(fallbackDomain);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Translator.prototype, "domain", {
        get: function () {
            return this.fallbackDomain;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Translator.prototype, "fallbackLocale", {
        get: function () {
            return this._fallbackLocale;
        },
        set: function (fallbackLocale) {
            this.setFallbackLocale(fallbackLocale);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Translator.prototype, "locale", {
        get: function () {
            return this.fallbackLocale;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Translator.prototype, "formatter", {
        get: function () {
            return this._formatter;
        },
        set: function (formatter) {
            this.setFormatter(formatter);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Translator.prototype, "translations", {
        get: function () {
            return Array.from(this._catalogs.entries()).reduce(function (accu, _a) {
                var key = _a[0], catalog = _a[1];
                var _b = Translator.parseMapKey(key), domain = _b[0], locale = _b[1];
                if (!accu[locale])
                    accu[locale] = {};
                accu[locale][domain] = catalog;
                return accu;
            }, {});
        },
        enumerable: false,
        configurable: true
    });
    Translator.getCatalogValue = function (catalog, key) {
        var closure = function (catalog) {
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
                    return closure.apply(void 0, __spreadArray([catalog[currentKey]], keys, false));
            }
            return key;
        };
        return closure.apply(void 0, __spreadArray([catalog], key.split('.'), false));
    };
    return Translator;
}());
var proxy = new Proxy(Translator, {
    apply: function (target, thisArg, args) {
        return Translator.create.apply(Translator, args);
    },
    construct: function (target, args) {
        return new (Translator.bind.apply(Translator, __spreadArray([void 0], args, false)))();
    },
    set: function () {
        throw new Error('It\'s not allowed to add a property to Translator class, please use a composition relation instead.');
    }
});
exports.Translator = proxy;
exports.default = proxy;
exports.createTranslator = Translator.create;
exports.formatMessage = format;
exports.getCatalogValue = Translator.getCatalogValue;
exports.mergeCatalogs = Translator.mergeCatalogs;
exports.translate = Translator.translate;
//# sourceMappingURL=index.js.map