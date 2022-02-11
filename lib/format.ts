import { ReplacementType } from "./types";

export default function format(message: string, replacements?: ReplacementType|undefined|null|string, locale?: string) {
    if (typeof replacements === 'string') {
        locale = replacements;
        replacements = undefined;
    }
    let result = message;
    if (replacements) {
        for (let keys = Object.keys(replacements), idx = 0; idx < keys.length; idx++) {
            result = result.replace(new RegExp(`{${keys[idx]}`, 'g'), String(replacements[keys[idx]]));
        }
    }

    return result;
}
