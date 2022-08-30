import { DEFAULT_LOCALE } from "./constants";

export default function format(message: string, replacements: { [key: string]: number|string }, locale: string = DEFAULT_LOCALE) {
    let result = message;
    for (let keys = Object.keys(replacements), idx = 0; idx < keys.length; idx++) {
        result = result.replace(new RegExp(`${keys[idx]}`, 'g'), String(replacements[keys[idx]]));
    }

    return result;
}
