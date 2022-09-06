"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var helper_module_imports_1 = require("@babel/helper-module-imports");
var BabelTypes = __importStar(require("@babel/types"));
var translations_1 = require("@jochlain/translations");
var babel_plugin_macros_1 = require("babel-plugin-macros");
var fs = __importStar(require("fs"));
var intl_messageformat_1 = __importDefault(require("intl-messageformat"));
var path = __importStar(require("path"));
var AVAILABLE_METHODS = ['createTranslator', 'translate'];
var DEFAULT_ROOT_DIR = 'translations';
var INTL_IDENTIFIER = 'jochlain_translation_intl_formatter';
var MACRO_CREATE_TRANSLATOR_AVAILABLE_OPTION_KEYS = ['domain', 'host', 'locale'];
var MACRO_CREATE_TRANSLATOR_SIGNATURE = "createTranslator({ domain?: string, host?: string, locale?: identifier|string })";
var MACRO_TRANSLATE_AVAILABLE_OPTION_KEYS = ['domain', 'host', 'locale'];
var MACRO_TRANSLATE_SIGNATURE = "translate(message: identifier|string, replacements: identifier|{ [key: string]: number|string }, { domain: string = 'messages', locale: identifier|string = 'en', host?: string })";
var IMPORT_OPTIONS = {
    importedType: 'commonjs',
    importedInterop: 'babel',
    importingInterop: 'babel',
};
var formatter = { format: function (message, replacements, locale) { return String((new intl_messageformat_1.default(message, locale)).format(replacements)); } };
var programMap = new Map();
var cache = new (function () {
    function Cache() {
        this.watched = false;
        this.buffer = new Map();
    }
    Cache.prototype.get = function (key) {
        return this.buffer.get(key);
    };
    Cache.prototype.set = function (key, value) {
        this.buffer.set(key, value);
    };
    Cache.prototype.watch = function (rootDir) {
        var _this = this;
        if (!this.watched) {
            this.watched = true;
            fs.watch(rootDir, { recursive: true }, function (evt, filename) {
                if (evt === 'change') {
                    var keys = Array.from(_this.buffer.keys());
                    for (var idx = 0; idx < keys.length; idx++) {
                        if (filename.includes(keys[idx])) {
                            _this.buffer.delete(keys[idx]);
                        }
                    }
                }
            });
        }
    };
    return Cache;
}());
var searchModule = function (node, moduleName, name, isDefault) {
    if (isDefault === void 0) { isDefault = false; }
    var programPath = getProgramPath(node);
    var isMod = (0, helper_module_imports_1.isModule)(programPath);
    var isModuleForNode = isMod && IMPORT_OPTIONS.importingInterop === "node";
    var isModuleForBabel = isMod && IMPORT_OPTIONS.importingInterop === "babel";
    if (IMPORT_OPTIONS.importedType === 'es6') {
        return searchModuleInImport(node, moduleName, name, isDefault);
    }
    else if (IMPORT_OPTIONS.importedType === 'commonjs') {
        if (['babel', 'compiled', 'uncompiled'].includes(IMPORT_OPTIONS.importedInterop)) {
            if (isModuleForNode || isModuleForBabel) {
                return searchModuleInImport(node, moduleName, name, isDefault);
            }
            else {
                return null;
            }
        }
        else {
            throw new Error("Unknown importedInterop \"".concat(IMPORT_OPTIONS.importedInterop, "\"."));
        }
    }
    else {
        throw new Error("Unexpected interopType \"".concat(IMPORT_OPTIONS.importedType, "\""));
    }
};
var searchModuleInImport = function (node, moduleName, name, isDefault) {
    if (isDefault === void 0) { isDefault = false; }
    var body = getProgramBody(node);
    for (var idx = 0; idx < body.length; idx++) {
        if (!BabelTypes.isImportDeclaration(body[idx].node))
            return null;
        var child = body[idx].node;
        if (child.source.value !== moduleName)
            continue;
        for (var spec_idx = 0; spec_idx < child.specifiers.length; spec_idx++) {
            var specifier = child.specifiers[spec_idx];
            if (isDefault) {
                if (BabelTypes.isImportDefaultSpecifier(specifier)) {
                    throw new Error('Can\'t fully support default import');
                }
            }
            else {
                if (BabelTypes.isImportSpecifier(specifier)) {
                    if (specifier.local.name === name) {
                        if (BabelTypes.isStringLiteral(specifier.imported)) {
                            return BabelTypes.identifier(specifier.imported.value);
                        }
                        return specifier.imported;
                    }
                }
            }
        }
    }
    return null;
};
var getProgramPath = function (node) {
    if (!programMap.has(node)) {
        var programPath = node.find(function (node) { return node.isProgram(); });
        if (!programPath) {
            throw node.parentPath
                ? node.parentPath.buildCodeFrameError("Can't reach program node", babel_plugin_macros_1.MacroError)
                : new Error("Can't reach program node");
        }
        programMap.set(node, programPath);
    }
    return programMap.get(node);
};
var getProgramBody = function (node) {
    var program = getProgramPath(node);
    var body = program.get('body');
    if (!Array.isArray(body))
        return [body];
    return body;
};
var insertImport = function (node, statements) {
    var body = getProgramBody(node);
    for (var idx = body.length - 1; idx >= 0; idx--) {
        if (body[idx].isImportDeclaration()) {
            body[idx].insertAfter(statements);
            return;
        }
    }
    body[0].insertBefore(statements);
};
var getModule = function (node, moduleName, name, isDefault) {
    if (isDefault === void 0) { isDefault = false; }
    var mod = searchModule(node, moduleName, name, isDefault);
    if (mod)
        return mod;
    if (isDefault) {
        return (0, helper_module_imports_1.addDefault)(node.parentPath, moduleName, __assign(__assign({}, IMPORT_OPTIONS), { nameHint: name }));
    }
    return (0, helper_module_imports_1.addNamed)(node.parentPath, name, moduleName, __assign(__assign({}, IMPORT_OPTIONS), { nameHint: name }));
};
var AbstractMacro = (function () {
    function AbstractMacro(types, loader, options) {
        this.types = types;
        this.loader = loader;
        this.options = options;
    }
    AbstractMacro.prototype.createIntlFormatter = function (node) {
        var body = getProgramBody(node);
        for (var idx = 0; idx < body.length; idx++) {
            if (!this.types.isVariableDeclaration(body[idx].node))
                continue;
            var child = body[idx].node;
            for (var decl_idx = 0; decl_idx < child.declarations.length; decl_idx++) {
                var declarator = child.declarations[decl_idx];
                if (this.types.isIdentifier(declarator.id) && declarator.id.name === INTL_IDENTIFIER) {
                    return declarator.id;
                }
            }
        }
        var nodeIntl = getModule(node, 'intl-messageformat', 'IntlMessageFormat');
        var nodeIdentifier = this.types.identifier(INTL_IDENTIFIER);
        var nodeLocale = this.types.identifier('locale');
        var nodeMessage = this.types.identifier('message');
        var nodeReplacements = this.types.identifier('replacements');
        insertImport(node, this.types.variableDeclaration('const', [
            this.types.variableDeclarator(nodeIdentifier, this.types.objectExpression([
                this.types.objectProperty(this.types.identifier('format'), this.types.arrowFunctionExpression([nodeMessage, nodeReplacements, nodeLocale], this.types.blockStatement([
                    this.types.returnStatement(this.types.callExpression(this.types.memberExpression(this.types.parenthesizedExpression(this.types.newExpression(nodeIntl, [nodeMessage, nodeLocale])), this.types.identifier('format')), [nodeReplacements]))
                ])))
            ]))
        ]));
        return nodeIdentifier;
    };
    AbstractMacro.prototype.getCatalogs = function (node, rootDir, domain, locale) {
        var key = "".concat(path.relative(process.cwd(), rootDir), "/").concat(domain || '', "/").concat(locale || '');
        if (!cache.get(key)) {
            var files = this.getFiles(node, rootDir, domain, locale);
            var catalogs = {};
            for (var idx = 0; idx < files.length; idx++) {
                Object.assign(catalogs, (0, translations_1.mergeCatalogs)(catalogs, this.load(rootDir, files[idx])));
            }
            cache.set(key, catalogs);
        }
        return cache.get(key);
    };
    AbstractMacro.prototype.getFiles = function (node, rootDir, domain, locale) {
        var _this = this;
        try {
            var stat = fs.lstatSync(rootDir);
            if (stat.isDirectory()) {
                return fs.readdirSync(rootDir).filter(function (file) { return _this.testFile(file, domain, locale); });
            }
        }
        catch (error) {
        }
        throw node.parentPath.buildCodeFrameError("Host parameter must refer to a directory", babel_plugin_macros_1.MacroError);
    };
    AbstractMacro.prototype.load = function (rootDir, file) {
        var _a, _b;
        var _c = this.matchFile(file), domain = _c[0], locale = _c[1];
        var key = path.relative(process.cwd(), path.join(rootDir, file));
        if (!cache.get(key)) {
            var filename = path.join(rootDir, file);
            var content = fs.readFileSync(filename).toString();
            cache.set(key, this.loader.load(content));
        }
        return _a = {}, _a[locale] = (_b = {}, _b[domain] = cache.get(key), _b), _a;
    };
    AbstractMacro.prototype.matchFile = function (file) {
        var _a = file.split('.').reverse(), extension = _a[0], locale = _a[1], parts = _a.slice(2);
        return [parts.join('.'), locale, extension];
    };
    AbstractMacro.prototype.testFile = function (file, domain, locale) {
        var _a = this.matchFile(file), _domain = _a[0], _locale = _a[1], extension = _a[2];
        if (domain && _domain !== domain)
            return false;
        if (locale && _locale !== locale)
            return false;
        return this.loader.extension.test(".".concat(extension));
    };
    return AbstractMacro;
}());
var CreateTranslatorMacro = (function (_super) {
    __extends(CreateTranslatorMacro, _super);
    function CreateTranslatorMacro() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CreateTranslatorMacro.prototype.buildNode = function (node) {
        if (node === null)
            return;
        var _a = this.getOptions(node), domain = _a.domain, host = _a.host, locale = _a.locale;
        var rootDir = host ? path.join(this.options.rootDir, host) : this.options.rootDir;
        var method = getModule(node, '@jochlain/translations', 'createTranslator');
        var catalogs = this.getCatalogs(node, rootDir, domain, locale);
        var options = [this.types.objectProperty(this.types.identifier('formatter'), this.createIntlFormatter(node))];
        if (locale)
            options.push(this.types.objectProperty(this.types.identifier('locale'), this.types.stringLiteral(locale)));
        if (domain)
            options.push(this.types.objectProperty(this.types.identifier('domain'), this.types.stringLiteral(domain)));
        return this.types.callExpression(method, [
            this.types.valueToNode(catalogs),
            this.types.objectExpression(options)
        ]);
    };
    CreateTranslatorMacro.prototype.getOptions = function (node) {
        var _this = this;
        if (node.node.arguments.length > 1) {
            throw node.parentPath.buildCodeFrameError("Received an invalid number of arguments (must be 0 or 1)\n  Signature: ".concat(MACRO_CREATE_TRANSLATOR_SIGNATURE), babel_plugin_macros_1.MacroError);
        }
        if (!node.node.arguments.length)
            return {};
        if (!this.types.isObjectExpression(node.node.arguments[0])) {
            throw node.parentPath.buildCodeFrameError("Parameter must be an object\n  Signature: ".concat(MACRO_CREATE_TRANSLATOR_SIGNATURE), babel_plugin_macros_1.MacroError);
        }
        return node.node.arguments[0].properties.reduce(function (accu, property) {
            var _a;
            if (!_this.types.isObjectProperty(property)) {
                throw node.parentPath.buildCodeFrameError("Method option parameter must be an object of strings\n  Signature: ".concat(MACRO_CREATE_TRANSLATOR_SIGNATURE), babel_plugin_macros_1.MacroError);
            }
            if (!_this.types.isIdentifier(property.key) && !_this.types.isStringLiteral(property.key)) {
                throw node.parentPath.buildCodeFrameError("Method option parameter has an invalid key\n  Signature: ".concat(MACRO_CREATE_TRANSLATOR_SIGNATURE), babel_plugin_macros_1.MacroError);
            }
            var key = _this.types.isIdentifier(property.key) ? property.key.name : property.key.value;
            if (!MACRO_CREATE_TRANSLATOR_AVAILABLE_OPTION_KEYS.includes(key)) {
                throw node.parentPath.buildCodeFrameError("Option ".concat(key, " is not allowed\n  Signature: ").concat(MACRO_CREATE_TRANSLATOR_SIGNATURE), babel_plugin_macros_1.MacroError);
            }
            if (!_this.types.isStringLiteral(property.value)) {
                throw node.parentPath.buildCodeFrameError("Option ".concat(key, " must be a string\n  Signature: ").concat(MACRO_CREATE_TRANSLATOR_SIGNATURE), babel_plugin_macros_1.MacroError);
            }
            return (__assign(__assign({}, accu), (_a = {}, _a[key] = property.value.value, _a)));
        }, {});
    };
    return CreateTranslatorMacro;
}(AbstractMacro));
var TranslateMacro = (function (_super) {
    __extends(TranslateMacro, _super);
    function TranslateMacro() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TranslateMacro.prototype.buildNode = function (node) {
        if (!node)
            return;
        if (this.isLocaleLiteral(node)) {
            return this.buildNodeWithLiteralLocale(node);
        }
        return this.buildNodeWithIdentifierLocale(node);
    };
    TranslateMacro.prototype.buildNodeWithIdentifierLocale = function (node) {
        var _a = this.getArguments(node), catalog = _a.catalog, replacements = _a.replacements, locale = _a.locale;
        var translateMethodIdentifier = getModule(node, '@jochlain/translations', 'translate');
        return this.types.callExpression(translateMethodIdentifier, [
            this.types.valueToNode(catalog),
            this.types.valueToNode(replacements),
            this.types.identifier(locale),
            this.createIntlFormatter(node),
        ]);
    };
    TranslateMacro.prototype.buildNodeWithLiteralLocale = function (node) {
        var _a = this.getArguments(node), catalog = _a.catalog, replacements = _a.replacements, locale = _a.locale;
        var value = (0, translations_1.translate)(catalog, replacements, locale, formatter);
        return this.types.stringLiteral(value);
    };
    TranslateMacro.prototype.getArguments = function (node) {
        var _a;
        var message = this.getArgumentMessage(node);
        var replacements = this.getArgumentReplacements(node);
        var _b = this.getOptions(node), domain = _b.domain, host = _b.host, locale = _b.locale;
        var rootDir = host ? path.resolve(this.options.rootDir, host) : this.options.rootDir;
        if (this.isLocaleLiteral(node)) {
            var catalogs_1 = this.getCatalogs(node, rootDir, domain, locale);
            var value = message;
            if (catalogs_1 && catalogs_1[locale] && catalogs_1[locale][domain]) {
                value = (0, translations_1.getCatalogValue)(catalogs_1[locale][domain], message);
            }
            var catalog_1 = (_a = {}, _a[locale] = value, _a);
            return { catalog: catalog_1, replacements: replacements, locale: locale };
        }
        var catalogs = this.getCatalogs(node, rootDir, domain);
        var catalog = Object.keys(catalogs).reduce(function (accu, locale) {
            var _a;
            return (__assign(__assign({}, accu), (_a = {}, _a[locale] = (0, translations_1.getCatalogValue)(catalogs[locale][domain], message), _a)));
        }, {});
        return { catalog: catalog, replacements: replacements, locale: locale };
    };
    TranslateMacro.prototype.getArgumentMessage = function (node) {
        return node.node.arguments[0].value;
    };
    TranslateMacro.prototype.getArgumentReplacements = function (node) {
        var _this = this;
        if (node.node.arguments.length <= 1)
            return {};
        if (this.types.isNullLiteral(node.node.arguments[1]))
            return {};
        if (!this.types.isObjectExpression(node.node.arguments[1])) {
            throw node.parentPath.buildCodeFrameError("Replacement argument is not an object", babel_plugin_macros_1.MacroError);
        }
        return node.node.arguments[1].properties.reduce(function (accu, property) {
            var _a, _b;
            if (!_this.types.isObjectProperty(property))
                return accu;
            property = property;
            if (!property)
                return accu;
            if (!_this.types.isIdentifier(property.key) && !_this.types.isStringLiteral(property.key)) {
                throw node.parentPath.buildCodeFrameError("Replacements option parameter has an invalid key", babel_plugin_macros_1.MacroError);
            }
            var key = _this.types.isIdentifier(property.key) ? property.key.name : property.key.value;
            if (_this.types.isStringLiteral(property.value)) {
                return __assign(__assign({}, accu), (_a = {}, _a[key] = property.value.value, _a));
            }
            else if (_this.types.isNumericLiteral(property.value)) {
                return __assign(__assign({}, accu), (_b = {}, _b[key] = property.value.value, _b));
            }
            throw node.parentPath.buildCodeFrameError("Replacements option parameter must be an object of string or number", babel_plugin_macros_1.MacroError);
        }, {});
    };
    TranslateMacro.prototype.getOptions = function (node) {
        var _this = this;
        if (node.node.arguments.length > 3) {
            throw node.parentPath.buildCodeFrameError("Received an invalid number of arguments.\n Signature: ".concat(MACRO_TRANSLATE_SIGNATURE), babel_plugin_macros_1.MacroError);
        }
        if (!node.node.arguments.length) {
            throw node.parentPath.buildCodeFrameError("Message argument is mandatory.\n Signature: ".concat(MACRO_TRANSLATE_SIGNATURE), babel_plugin_macros_1.MacroError);
        }
        if (!this.types.isStringLiteral(node.node.arguments[0])) {
            throw node.parentPath.buildCodeFrameError("Message argument must be a string.\nIf you want to use variable for domain, please use createTranslator instead.\n Signature: ".concat(MACRO_TRANSLATE_SIGNATURE), babel_plugin_macros_1.MacroError);
        }
        if (node.node.arguments[2] && !this.types.isObjectExpression(node.node.arguments[2])) {
            throw node.parentPath.buildCodeFrameError("Options argument is not a object.\n Signature: ".concat(MACRO_TRANSLATE_SIGNATURE), babel_plugin_macros_1.MacroError);
        }
        var options = ((node.node.arguments[2] ? node.node.arguments[2].properties : []) || []).reduce(function (accu, property) {
            var _a, _b, _c;
            if (!_this.types.isObjectProperty(property)) {
                throw node.parentPath.buildCodeFrameError("Method option parameter must be an object of strings", babel_plugin_macros_1.MacroError);
            }
            if (!_this.types.isIdentifier(property.key) && !_this.types.isStringLiteral(property.key)) {
                throw node.parentPath.buildCodeFrameError("Method option parameter has an invalid key", babel_plugin_macros_1.MacroError);
            }
            var key = _this.types.isIdentifier(property.key) ? property.key.name : property.key.value;
            if (!MACRO_TRANSLATE_AVAILABLE_OPTION_KEYS.includes(key)) {
                throw node.parentPath.buildCodeFrameError("Option ".concat(key, " is not allowed"), babel_plugin_macros_1.MacroError);
            }
            if ('locale' === key) {
                if (_this.types.isStringLiteral(property.value)) {
                    return (__assign(__assign({}, accu), (_a = {}, _a[key] = property.value.value, _a)));
                }
                if (_this.types.isIdentifier(property.value)) {
                    return (__assign(__assign({}, accu), (_b = {}, _b[key] = property.value.name, _b)));
                }
                throw node.parentPath.buildCodeFrameError("Option ".concat(key, " must be a string or a variable"), babel_plugin_macros_1.MacroError);
            }
            if (!_this.types.isStringLiteral(property.value)) {
                throw node.parentPath.buildCodeFrameError("Option ".concat(key, " must be a string"), babel_plugin_macros_1.MacroError);
            }
            return (__assign(__assign({}, accu), (_c = {}, _c[key] = property.value.value, _c)));
        }, {});
        return Object.assign({ domain: 'messages', host: undefined, locale: 'en' }, options);
    };
    TranslateMacro.prototype.isLocaleLiteral = function (node) {
        if (!node.node.arguments[2])
            return true;
        if (!this.types.isObjectExpression(node.node.arguments[2]))
            return false;
        for (var idx = 0; idx < node.node.arguments[2].properties.length; idx++) {
            var property = node.node.arguments[2].properties[idx];
            if (!this.types.isObjectProperty(property))
                continue;
            if (!this.types.isIdentifier(property.key) && !this.types.isStringLiteral(property.key))
                continue;
            var key = this.types.isIdentifier(property.key) ? property.key.name : property.key.value;
            if (key === 'locale')
                return this.types.isStringLiteral(property.value);
        }
        return true;
    };
    return TranslateMacro;
}(AbstractMacro));
var createTranslatorMacro = function (types, loader, options) {
    return new CreateTranslatorMacro(types, loader, options);
};
var createTranslateMacro = function (types, loader, options) {
    return new TranslateMacro(types, loader, options);
};
var getOptions = function (config) {
    var options = Object.assign({ rootDir: DEFAULT_ROOT_DIR }, config);
    return Object.assign(options, {
        rootDir: path.resolve(process.cwd(), options.rootDir),
    });
};
exports.default = (function (loader) { return function (_a) {
    var babel = _a.babel, config = _a.config, references = _a.references;
    var types = babel.types;
    var options = getOptions(config);
    var factoryTranslator = createTranslatorMacro(types, loader, options);
    var factoryTranslate = createTranslateMacro(types, loader, options);
    console.log(options.watch ? 'WATCH !!!!! \n\n\n' : 'NO WATCH !!!!! \n\n\n');
    if (options.watch) {
        cache.watch(options.rootDir);
    }
    Object.keys(references).forEach(function (method) {
        references[method].forEach(function (node) {
            if (!node.parentPath)
                return;
            if (!types.isCallExpression(node.parentPath.node)) {
                throw node.parentPath
                    ? node.parentPath.buildCodeFrameError("Only method call can be used by macro", babel_plugin_macros_1.MacroError)
                    : new Error("Only method call can be used by macro");
            }
            if (!AVAILABLE_METHODS.includes(method)) {
                throw node.parentPath
                    ? node.parentPath.buildCodeFrameError("Method must be one of ".concat(AVAILABLE_METHODS.join(' or ')), babel_plugin_macros_1.MacroError)
                    : new Error("Method must be one of ".concat(AVAILABLE_METHODS.join(' or ')));
            }
            switch (method) {
                case 'createTranslator': {
                    var translator = factoryTranslator.buildNode(node.parentPath);
                    if (translator && node.parentPath)
                        node.parentPath.replaceWith(translator);
                    break;
                }
                case 'translate': {
                    var translate_1 = factoryTranslate.buildNode(node.parentPath);
                    if (translate_1 && node.parentPath)
                        node.parentPath.replaceWith(translate_1);
                    break;
                }
            }
        });
    });
}; });
//# sourceMappingURL=index.js.map