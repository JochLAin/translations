import { ReplacementType } from "./types";
import {DEFAULT_LOCALE} from "./contants";

/**
 * Default format methods which replace occurrences in a sentence
 *
 * @param message - Message to translate
 * @param replacements - Replacements variables
 * @param locale - The locale use
 */
export default function format(message: string, replacements: ReplacementType, locale: string = DEFAULT_LOCALE) {
    let result = message;
    for (let keys = Object.keys(replacements), idx = 0; idx < keys.length; idx++) {
        result = result.replace(new RegExp(`${keys[idx]}`, 'g'), String(replacements[keys[idx]]));
    }

    return result;
}
