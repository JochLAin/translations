import { IntlMessageFormat } from "intl-messageformat";
import { DEFAULT_LOCALE } from "./contants";
import Translator, { create, translate } from './model';
var formatter = {
    format: function (message, replacements, locale) {
        if (locale === void 0) { locale = DEFAULT_LOCALE; }
        return String((new IntlMessageFormat(message, locale)).format(replacements));
    }
};
var createIntl = function (translations, locale, domain) {
    return create(translations, { domain: domain, locale: locale, formatter: formatter });
};
var translateIntl = function (catalog, replacements, locale) {
    return translate(catalog, replacements, locale, formatter);
};
export default createIntl;
export { Translator, create, translateIntl as translate };
//# sourceMappingURL=index.js.map