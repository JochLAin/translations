"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
function format(message, replacements, locale = constants_1.DEFAULT_LOCALE) {
    let result = message;
    for (let keys = Object.keys(replacements), idx = 0; idx < keys.length; idx++) {
        result = result.replace(new RegExp(`${keys[idx]}`, 'g'), String(replacements[keys[idx]]));
    }
    return result;
}
exports.default = format;
//# sourceMappingURL=format.js.map