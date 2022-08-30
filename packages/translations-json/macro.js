var { createMacro } = require("babel-plugin-macros");
var getTranslationMacro = require("./index").default;

var macro = getTranslationMacro({
    extension: /\.json$/,
    load: function (content) {
        return JSON.parse(content);
    },
});

module.exports = createMacro(macro, {
    configName: '@jochlain/translations-json',
});
