import { IntlMessageFormat } from "intl-messageformat";
import Translator, { create } from './model';
import { ReplacementType, TranslationType } from "./types";

export default (translations: TranslationType, locale?: string, domain?: string) => {
    const formatter = { format: (message: string, replacements: ReplacementType, locale: string): string => String((new IntlMessageFormat(message, locale)).format(replacements)) };
    return create(translations, { domain, locale, formatter });
};

export { Translator, create };
