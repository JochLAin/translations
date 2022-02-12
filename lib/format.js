"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contants_1 = require("./contants");
function format(message, replacements, locale = contants_1.DEFAULT_LOCALE) {
    let result = message;
    for (let keys = Object.keys(replacements), idx = 0; idx < keys.length; idx++) {
        result = result.replace(new RegExp(`{${keys[idx]}`, 'g'), String(replacements[keys[idx]]));
    }
    return result;
}
exports.default = format;
//# sourceMappingURL=format.js.map