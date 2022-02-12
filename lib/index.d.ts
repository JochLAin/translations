import Translator, { create } from './model';
import { ReplacementType, TranslationType } from "./types";
declare const createIntl: (translations: TranslationType, locale?: string | undefined, domain?: string | undefined) => Translator;
declare const translateIntl: (catalog: {
    [locale: string]: string;
}, replacements?: ReplacementType | undefined, locale?: string | undefined) => string;
export default createIntl;
export { Translator, create, translateIntl as translate };
