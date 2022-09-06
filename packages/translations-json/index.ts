import type { CatalogType, ReplacementType, TranslationType } from "@jochlain/translations";
import * as Babel from '@babel/core';
import { addDefault, addNamed, isModule } from "@babel/helper-module-imports";
import * as BabelTypes from '@babel/types';
import { getCatalogValue, mergeCatalogs, translate } from "@jochlain/translations";
import { MacroError, MacroParams } from "babel-plugin-macros";
import * as fs from "fs";
import IntlMessageFormat from "intl-messageformat";
import * as path from "path";

type LoaderType = { extension: RegExp, load: (content: string) => CatalogType };
type OptionsType = { rootDir: string, watch?: boolean };
type InputType = { [key: string]: any }|undefined;

const AVAILABLE_METHODS = ['createTranslator', 'translate'];
const DEFAULT_ROOT_DIR = 'translations';
const INTL_IDENTIFIER = 'jochlain_translation_intl_formatter';

const MACRO_CREATE_TRANSLATOR_AVAILABLE_OPTION_KEYS = ['domain', 'host', 'locale'];
const MACRO_CREATE_TRANSLATOR_SIGNATURE = `createTranslator({ domain?: string, host?: string, locale?: identifier|string })`;

const MACRO_TRANSLATE_AVAILABLE_OPTION_KEYS = ['domain', 'host', 'locale'];
const MACRO_TRANSLATE_SIGNATURE = `translate(message: identifier|string, replacements: identifier|{ [key: string]: number|string }, { domain: string = 'messages', locale: identifier|string = 'en', host?: string })`;

const IMPORT_OPTIONS = {
  importedType: 'commonjs',
  importedInterop: 'babel',
  importingInterop: 'babel',
};

const formatter = { format: (message: string, replacements: ReplacementType, locale: string): string => String((new IntlMessageFormat(message, locale)).format(replacements)) };
const programMap = new Map<Babel.NodePath<BabelTypes.Node>, Babel.NodePath<BabelTypes.Program>>();

const cache = new class Cache {
  buffer: Map<string, any>;
  watched: boolean = false;

  constructor() {
    this.buffer = new Map<string, any>();
  }

  get(key: string): any {
    return this.buffer.get(key);
  }

  set(key: string, value: any) {
    this.buffer.set(key, value);
  }

  watch(rootDir: string) {
    if (!this.watched) {
      this.watched = true;
      fs.watch(rootDir, { recursive: true }, (evt, filename) => {
        if (evt === 'change') {
          const keys = Array.from(this.buffer.keys());
          for (let idx = 0; idx < keys.length; idx++) {
            if (filename.includes(keys[idx])) {
              this.buffer.delete(keys[idx]);
            }
          }
        }
      });
    }
  }
}

const searchModule = (node: Babel.NodePath<BabelTypes.Node>, moduleName: string, name: string, isDefault: boolean = false): BabelTypes.Identifier|null => {
  const programPath = getProgramPath(node);
  const isMod = isModule(programPath);
  const isModuleForNode = isMod && IMPORT_OPTIONS.importingInterop === "node";
  const isModuleForBabel = isMod && IMPORT_OPTIONS.importingInterop === "babel";

  if (IMPORT_OPTIONS.importedType === 'es6') {
    return searchModuleInImport(node, moduleName, name, isDefault);
  } else if (IMPORT_OPTIONS.importedType === 'commonjs') {
    if (['babel', 'compiled', 'uncompiled'].includes(IMPORT_OPTIONS.importedInterop)) {
      if (isModuleForNode || isModuleForBabel) {
        return searchModuleInImport(node, moduleName, name, isDefault);
      } else {
        return null;
        //     return searchModuleInRequire(node, moduleName, name, isDefault);
      }
    } else {
      throw new Error(`Unknown importedInterop "${IMPORT_OPTIONS.importedInterop}".`);
    }
  } else {
    throw new Error(`Unexpected interopType "${IMPORT_OPTIONS.importedType}"`);
  }
}

const searchModuleInImport = (node: Babel.NodePath<BabelTypes.Node>, moduleName: string, name: string, isDefault: boolean = false): BabelTypes.Identifier|null => {
  const body = getProgramBody(node);
  for (let idx = 0; idx < body.length; idx++) {
    if (!BabelTypes.isImportDeclaration(body[idx].node)) return null;
    const child = body[idx].node as BabelTypes.ImportDeclaration;
    if (child.source.value !== moduleName) continue;
    for (let spec_idx = 0; spec_idx < child.specifiers.length; spec_idx++) {
      const specifier = child.specifiers[spec_idx];
      if (isDefault) {
        if (BabelTypes.isImportDefaultSpecifier(specifier)) {
          throw new Error('Can\'t fully support default import');
          // return specifier.local;
        }
      } else {
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

const getProgramPath = (node: Babel.NodePath<BabelTypes.Node>): Babel.NodePath<BabelTypes.Program> => {
  if (!programMap.has(node)) {
    const programPath = node.find((node) => node.isProgram());
    if (!programPath) {
      throw node.parentPath
        ? node.parentPath.buildCodeFrameError(`Can't reach program node`, MacroError)
        : new Error(`Can't reach program node`)
        ;
    }
    programMap.set(node, programPath as Babel.NodePath<BabelTypes.Program>);
  }
  return programMap.get(node) as Babel.NodePath<BabelTypes.Program>;
};

const getProgramBody = (node: Babel.NodePath<BabelTypes.Node>): Babel.NodePath<BabelTypes.Node>[] => {
  const program = getProgramPath(node);
  const body = program.get('body');
  if (!Array.isArray(body)) return [body];
  return body;
};

const insertImport = (node: Babel.NodePath<BabelTypes.Node>, statements: any) => {
  const body = getProgramBody(node);
  for (let idx = body.length -1; idx >= 0; idx--) {
    if (body[idx].isImportDeclaration()) {
      body[idx].insertAfter(statements);
      return;
    }
  }

  // No import declaration
  body[0].insertBefore(statements);
};

const getModule = (node: Babel.NodePath<BabelTypes.Node>, moduleName: string, name: string, isDefault: boolean = false) => {
  const mod = searchModule(node, moduleName, name, isDefault);
  if (mod) return mod;

  // Create import
  if (isDefault) {
    return addDefault(node.parentPath, moduleName, { ...IMPORT_OPTIONS, nameHint: name });
  }
  return addNamed(node.parentPath, name, moduleName, { ...IMPORT_OPTIONS, nameHint: name });
}

class AbstractMacro {
  types: typeof BabelTypes;
  loader: LoaderType;
  options: OptionsType;

  constructor(types: typeof BabelTypes, loader: LoaderType, options: OptionsType) {
    this.types = types;
    this.loader = loader;
    this.options = options;
  }

  createIntlFormatter(node: Babel.NodePath<BabelTypes.CallExpression>) {
    const body = getProgramBody(node);
    for (let idx = 0; idx < body.length; idx++) {
      if (!this.types.isVariableDeclaration(body[idx].node)) continue;
      const child = body[idx].node as BabelTypes.VariableDeclaration;
      for (let decl_idx = 0; decl_idx < child.declarations.length; decl_idx++) {
        const declarator = child.declarations[decl_idx];
        if (this.types.isIdentifier(declarator.id) && declarator.id.name === INTL_IDENTIFIER) {
          return declarator.id;
        }
      }
    }

    const nodeIntl = getModule(node, 'intl-messageformat', 'IntlMessageFormat');
    const nodeIdentifier = this.types.identifier(INTL_IDENTIFIER);
    const nodeLocale = this.types.identifier('locale');
    const nodeMessage = this.types.identifier('message');
    const nodeReplacements = this.types.identifier('replacements');

    insertImport(node, this.types.variableDeclaration('const', [
      this.types.variableDeclarator(
        nodeIdentifier,
        this.types.objectExpression([
          this.types.objectProperty(
            this.types.identifier('format'),
            this.types.arrowFunctionExpression(
              [nodeMessage, nodeReplacements, nodeLocale],
              this.types.blockStatement([
                this.types.returnStatement(
                  this.types.callExpression(
                    this.types.memberExpression(
                      this.types.parenthesizedExpression(this.types.newExpression(nodeIntl, [nodeMessage, nodeLocale])),
                      this.types.identifier('format')
                    ),
                    [nodeReplacements]
                  )
                )
              ])
            )
          )
        ])
      )
    ]));

    return nodeIdentifier;
  }

  getCatalogs(node: Babel.NodePath<BabelTypes.CallExpression>, rootDir: string, domain?: string, locale?: string): TranslationType {
    const key = `${path.relative(process.cwd(), rootDir)}/${domain || ''}/${locale || ''}`;
    if (!cache.get(key)) {
        const files = this.getFiles(node, rootDir, domain, locale);
        const catalogs = {};
        for (let idx = 0; idx < files.length; idx++) {
            Object.assign(catalogs, mergeCatalogs(catalogs, this.load(rootDir, files[idx])));
        }
        cache.set(key, catalogs);
    }
    return cache.get(key);
  }

  getFiles(node: Babel.NodePath<BabelTypes.CallExpression>, rootDir: string, domain?: string, locale?: string): string[] {
    try {
      const stat = fs.lstatSync(rootDir);
      if (stat.isDirectory()) {
        return fs.readdirSync(rootDir).filter((file) => this.testFile(file, domain, locale));
      }
    } catch (error) {
    }

    throw node.parentPath.buildCodeFrameError(
      `Host parameter must refer to a directory`,
      MacroError
    );
  }

  load(rootDir: string, file: string): TranslationType {
    const [domain, locale] = this.matchFile(file);
    const key = path.relative(process.cwd(), path.join(rootDir, file));
    if (!cache.get(key)) {
        const filename = path.join(rootDir, file);
        const content = fs.readFileSync(filename).toString();
        cache.set(key, this.loader.load(content));
    }
    return { [locale]: { [domain]: cache.get(key) } };
    // return { [locale]: { [domain]: this.loader.load(fs.readFileSync(path.join(rootDir, file)).toString()) } };
  }

  matchFile(file: string): string[] {
    const [extension, locale, ...parts] = file.split('.').reverse();
    return [parts.join('.'), locale, extension];
  }

  testFile(file: string, domain?: string, locale?: string) {
    const [_domain, _locale, extension] = this.matchFile(file);
    if (domain && _domain !== domain) return false;
    if (locale && _locale !== locale) return false;
    return this.loader.extension.test(`.${extension}`);
  }
}

class CreateTranslatorMacro extends AbstractMacro {
  buildNode(node: Babel.NodePath<BabelTypes.CallExpression>|null) {
    if (node === null) return;
    const { domain, host, locale } = this.getOptions(node);
    const rootDir = host ? path.join(this.options.rootDir, host) : this.options.rootDir;
    const method = getModule(node, '@jochlain/translations', 'createTranslator');
    const catalogs = this.getCatalogs(node, rootDir, domain, locale);

    const options = [this.types.objectProperty(this.types.identifier('formatter'), this.createIntlFormatter(node))];
    if (locale) options.push(this.types.objectProperty(this.types.identifier('locale'), this.types.stringLiteral(locale)));
    if (domain) options.push(this.types.objectProperty(this.types.identifier('domain'), this.types.stringLiteral(domain)));

    return this.types.callExpression(method, [
      this.types.valueToNode(catalogs),
      this.types.objectExpression(options)
    ]);
  }

  getOptions(node: Babel.NodePath<BabelTypes.CallExpression>) {
    if (node.node.arguments.length > 1) {
      throw node.parentPath.buildCodeFrameError(
        `Received an invalid number of arguments (must be 0 or 1)\n  Signature: ${MACRO_CREATE_TRANSLATOR_SIGNATURE}`,
        MacroError
      );
    }

    if (!node.node.arguments.length) return {};

    if (!this.types.isObjectExpression(node.node.arguments[0])) {
      throw node.parentPath.buildCodeFrameError(
        `Parameter must be an object\n  Signature: ${MACRO_CREATE_TRANSLATOR_SIGNATURE}`,
        MacroError
      );
    }

    return node.node.arguments[0].properties.reduce((accu: { [key: string]: string }, property: any) => {
      if (!this.types.isObjectProperty(property)) {
        throw node.parentPath.buildCodeFrameError(
          `Method option parameter must be an object of strings\n  Signature: ${MACRO_CREATE_TRANSLATOR_SIGNATURE}`,
          MacroError
        );
      }
      if (!this.types.isIdentifier(property.key) && !this.types.isStringLiteral(property.key)) {
        throw node.parentPath.buildCodeFrameError(
          `Method option parameter has an invalid key\n  Signature: ${MACRO_CREATE_TRANSLATOR_SIGNATURE}`,
          MacroError
        );
      }

      const key = this.types.isIdentifier(property.key) ? (property.key as BabelTypes.Identifier).name : (property.key as BabelTypes.StringLiteral).value;
      if (!MACRO_CREATE_TRANSLATOR_AVAILABLE_OPTION_KEYS.includes(key)) {
        throw node.parentPath.buildCodeFrameError(
          `Option ${key} is not allowed\n  Signature: ${MACRO_CREATE_TRANSLATOR_SIGNATURE}`,
          MacroError
        );
      }

      if (!this.types.isStringLiteral(property.value)) {
        throw node.parentPath.buildCodeFrameError(
          `Option ${key} must be a string\n  Signature: ${MACRO_CREATE_TRANSLATOR_SIGNATURE}`,
          MacroError
        );
      }

      return ({ ...accu, [key]: property.value.value });
    }, {})
  }
}

class TranslateMacro extends AbstractMacro {
  buildNode(node: Babel.NodePath<BabelTypes.CallExpression>|null) {
    if (!node) return;
    if (this.isLocaleLiteral(node)) {
      return this.buildNodeWithLiteralLocale(node);
    }
    return this.buildNodeWithIdentifierLocale(node);
  }

  buildNodeWithIdentifierLocale(node: Babel.NodePath<BabelTypes.CallExpression>) {
    const { catalog, replacements, locale } = this.getArguments(node);
    const translateMethodIdentifier = getModule(node, '@jochlain/translations', 'translate');

    return this.types.callExpression(translateMethodIdentifier, [
      this.types.valueToNode(catalog),
      this.types.valueToNode(replacements),
      this.types.identifier(locale),
      this.createIntlFormatter(node),
    ]);
  }

  buildNodeWithLiteralLocale(node: Babel.NodePath<BabelTypes.CallExpression>) {
    const { catalog, replacements, locale } = this.getArguments(node);
    const value = translate(catalog, replacements, locale, formatter);

    return this.types.stringLiteral(value);
  }

  getArguments(node: Babel.NodePath<BabelTypes.CallExpression>) {
    const message = this.getArgumentMessage(node);
    const replacements = this.getArgumentReplacements(node);
    const { domain, host, locale } = this.getOptions(node);
    const rootDir = host ? path.resolve(this.options.rootDir, host) : this.options.rootDir;

    if (this.isLocaleLiteral(node)) {
      const catalogs = this.getCatalogs(node, rootDir, domain, locale);
      let value = message;
      if (catalogs && catalogs[locale] && catalogs[locale][domain]) {
        value = getCatalogValue(catalogs[locale][domain], message);
      }
      const catalog = { [locale]: value };
      return { catalog, replacements, locale };
    }

    const catalogs = this.getCatalogs(node, rootDir, domain);
    const catalog = Object.keys(catalogs).reduce((accu, locale) => ({ ...accu, [locale]: getCatalogValue(catalogs[locale][domain], message) }), {});
    return { catalog, replacements, locale };
  }

  getArgumentMessage(node: Babel.NodePath<BabelTypes.CallExpression>): string {
    return (node.node.arguments[0] as BabelTypes.StringLiteral).value;
  }

  getArgumentReplacements(node: Babel.NodePath<BabelTypes.CallExpression>) {
    if (node.node.arguments.length <= 1) return {};
    if (this.types.isNullLiteral(node.node.arguments[1])) return {};

    if (!this.types.isObjectExpression(node.node.arguments[1])) {
      throw node.parentPath.buildCodeFrameError(
        `Replacement argument is not an object`,
        MacroError
      );
    }

    return (node.node.arguments[1] as BabelTypes.ObjectExpression).properties.reduce((accu: ReplacementType, property: any) => {
      if (!this.types.isObjectProperty(property)) return accu;
      property = property as BabelTypes.ObjectProperty;
      if (!property) return accu;

      if (!this.types.isIdentifier(property.key) && !this.types.isStringLiteral(property.key)) {
        throw node.parentPath.buildCodeFrameError(
          `Replacements option parameter has an invalid key`,
          MacroError
        );
      }

      const key = this.types.isIdentifier(property.key) ? (property.key as BabelTypes.Identifier).name : (property.key as BabelTypes.StringLiteral).value;
      if (this.types.isStringLiteral(property.value)) {
        return { ...accu, [key]: (property.value as BabelTypes.StringLiteral).value };
      } else if (this.types.isNumericLiteral(property.value)) {
        return { ...accu, [key]: (property.value as BabelTypes.NumericLiteral).value };
      }

      throw node.parentPath.buildCodeFrameError(
        `Replacements option parameter must be an object of string or number`,
        MacroError
      );
    }, {});
  }

  getOptions(node: Babel.NodePath<BabelTypes.CallExpression>) {
    if (node.node.arguments.length > 3) {
      throw node.parentPath.buildCodeFrameError(
        `Received an invalid number of arguments.\n Signature: ${MACRO_TRANSLATE_SIGNATURE}`,
        MacroError
      );
    }

    if (!node.node.arguments.length) {
      throw node.parentPath.buildCodeFrameError(
        `Message argument is mandatory.\n Signature: ${MACRO_TRANSLATE_SIGNATURE}`,
        MacroError
      );
    }

    if (!this.types.isStringLiteral(node.node.arguments[0])) {
      throw node.parentPath.buildCodeFrameError(
        `Message argument must be a string.\nIf you want to use variable for domain, please use createTranslator instead.\n Signature: ${MACRO_TRANSLATE_SIGNATURE}`,
        MacroError
      );
    }

    if (node.node.arguments[2] && !this.types.isObjectExpression(node.node.arguments[2])) {
      throw node.parentPath.buildCodeFrameError(
        `Options argument is not a object.\n Signature: ${MACRO_TRANSLATE_SIGNATURE}`,
        MacroError
      );
    }

    const options = ((node.node.arguments[2]? node.node.arguments[2].properties : []) || []).reduce((accu: InputType, property: any) => {
      if (!this.types.isObjectProperty(property)) {
        throw node.parentPath.buildCodeFrameError(
          `Method option parameter must be an object of strings`,
          MacroError
        );
      }
      if (!this.types.isIdentifier(property.key) && !this.types.isStringLiteral(property.key)) {
        throw node.parentPath.buildCodeFrameError(
          `Method option parameter has an invalid key`,
          MacroError
        );
      }

      const key = this.types.isIdentifier(property.key) ? (property.key as BabelTypes.Identifier).name : (property.key as BabelTypes.StringLiteral).value;
      if (!MACRO_TRANSLATE_AVAILABLE_OPTION_KEYS.includes(key)) {
        throw node.parentPath.buildCodeFrameError(
          `Option ${key} is not allowed`,
          MacroError
        );
      }

      if ('locale' === key) {
        if (this.types.isStringLiteral(property.value)) {
          return ({ ...accu, [key]: property.value.value });
        }
        if (this.types.isIdentifier(property.value)) {
          return ({ ...accu, [key]: property.value.name });
        }
        throw node.parentPath.buildCodeFrameError(
          `Option ${key} must be a string or a variable`,
          MacroError
        );
      }
      if (!this.types.isStringLiteral(property.value)) {
        throw node.parentPath.buildCodeFrameError(
          `Option ${key} must be a string`,
          MacroError
        );
      }

      return ({ ...accu, [key]: property.value.value });
    }, {});

    return Object.assign({ domain: 'messages', host: undefined, locale: 'en' }, options);
  }

  isLocaleLiteral(node: Babel.NodePath<BabelTypes.CallExpression>) {
    if (!node.node.arguments[2]) return true;
    if (!this.types.isObjectExpression(node.node.arguments[2])) return false;
    for (let idx = 0; idx < node.node.arguments[2].properties.length; idx++) {
      const property = node.node.arguments[2].properties[idx];
      if (!this.types.isObjectProperty(property)) continue;
      if (!this.types.isIdentifier(property.key) && !this.types.isStringLiteral(property.key)) continue;
      const key = this.types.isIdentifier(property.key) ? (property.key as BabelTypes.Identifier).name : (property.key as BabelTypes.StringLiteral).value;
      if (key === 'locale') return this.types.isStringLiteral(property.value);
    }
    // For options without locale
    return true;
  }
}

const createTranslatorMacro = (types: typeof BabelTypes, loader: LoaderType, options: OptionsType) => {
  return new CreateTranslatorMacro(types, loader, options);
};

const createTranslateMacro = (types: typeof BabelTypes, loader: LoaderType, options: OptionsType) => {
  return new TranslateMacro(types, loader, options);
};

const getOptions = (config: InputType): OptionsType => {
  const options = Object.assign({ rootDir: DEFAULT_ROOT_DIR }, config);
  return Object.assign(options, {
    rootDir: path.resolve(process.cwd(), options.rootDir),
  });
};

export default (loader: LoaderType) =>  ({ babel, config, references }: typeof MacroParams) => {
  const { types } = babel;
  const options = getOptions(config);
  const factoryTranslator = createTranslatorMacro(types, loader, options);
  const factoryTranslate = createTranslateMacro(types, loader, options);

  if (options.watch) {
    cache.watch(options.rootDir);
  }

  Object.keys(references).forEach((method) => {
    references[method].forEach((node: Babel.NodePath<BabelTypes.Node>) => {
      if (!node.parentPath) return;
      if (!types.isCallExpression(node.parentPath.node)) {
        throw node.parentPath
          ? node.parentPath.buildCodeFrameError(`Only method call can be used by macro`, MacroError)
          : new Error(`Only method call can be used by macro`)
          ;
      }

      if (!AVAILABLE_METHODS.includes(method)) {
        throw node.parentPath
          ? node.parentPath.buildCodeFrameError(`Method must be one of ${AVAILABLE_METHODS.join(' or ')}`, MacroError)
          : new Error(`Method must be one of ${AVAILABLE_METHODS.join(' or ')}`)
          ;
      }

      switch (method) {
        case 'createTranslator': {
          const translator = factoryTranslator.buildNode(node.parentPath as Babel.NodePath<BabelTypes.CallExpression>);
          if (translator && node.parentPath) node.parentPath.replaceWith(translator);
          break;
        }
        case 'translate': {
          const translate = factoryTranslate.buildNode(node.parentPath as Babel.NodePath<BabelTypes.CallExpression>);
          if (translate && node.parentPath) node.parentPath.replaceWith(translate);
          break;
        }
      }
    });
  });
};
