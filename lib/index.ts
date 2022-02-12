import { IntlMessageFormat } from "intl-messageformat";
import { DEFAULT_LOCALE } from "./contants";
import Translator, { create, translate } from './model';
import { ReplacementType, TranslationType } from "./types";

const formatter = {
    format: (message: string, replacements?: ReplacementType, locale: string = DEFAULT_LOCALE): string => {
        return String((new IntlMessageFormat(message, locale)).format(replacements));
    }
};

const createIntl = (translations: TranslationType, locale?: string, domain?: string) => {
    return create(translations, { domain, locale, formatter });
};

const translateIntl = (catalog: { [locale: string]: string }, replacements?: ReplacementType, locale?: string) => {
    return translate(catalog, replacements, locale, formatter);
};

export default createIntl;
export { Translator, create, translateIntl as translate };
