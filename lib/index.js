import { IntlMessageFormat } from "intl-messageformat";
import Translator, { create } from './model';
export default (function (translations, locale, domain) {
    var formatter = { format: function (message, replacements, locale) { return String((new IntlMessageFormat(message, locale)).format(replacements)); } };
    return create(translations, { domain: domain, locale: locale, formatter: formatter });
});
export { Translator, create };
//# sourceMappingURL=index.js.map