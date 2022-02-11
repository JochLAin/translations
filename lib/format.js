export default function format(message, replacements, locale) {
    if (typeof replacements === 'string') {
        locale = replacements;
        replacements = undefined;
    }
    var result = message;
    if (replacements) {
        for (var keys = Object.keys(replacements), idx = 0; idx < keys.length; idx++) {
            result = result.replace(new RegExp("{".concat(keys[idx]), 'g'), String(replacements[keys[idx]]));
        }
    }
    return result;
}
//# sourceMappingURL=format.js.map