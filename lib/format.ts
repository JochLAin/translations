import { DEFAULT_LOCALE } from "./constants";
import { ReplacementType } from "./types";

export default function format(message: string, replacements: ReplacementType, locale: string = DEFAULT_LOCALE) {
    let result = message;
    for (let keys = Object.keys(replacements), idx = 0; idx < keys.length; idx++) {
        result = result.replace(new RegExp(`${keys[idx]}`, 'g'), String(replacements[keys[idx]]));
    }

    return result;
}
