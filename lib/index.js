"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = exports.create = exports.Translator = void 0;
const intl_messageformat_1 = require("intl-messageformat");
const contants_1 = require("./contants");
const model_1 = __importStar(require("./model"));
exports.Translator = model_1.default;
Object.defineProperty(exports, "create", { enumerable: true, get: function () { return model_1.create; } });
const formatter = {
    format: (message, replacements, locale = contants_1.DEFAULT_LOCALE) => {
        return String((new intl_messageformat_1.IntlMessageFormat(message, locale)).format(replacements));
    }
};
const createIntl = (translations, locale, domain) => {
    return (0, model_1.create)(translations, { domain, locale, formatter });
};
const translateIntl = (catalog, replacements, locale) => {
    return (0, model_1.translate)(catalog, replacements, locale, formatter);
};
exports.translate = translateIntl;
exports.default = createIntl;
//# sourceMappingURL=index.js.map