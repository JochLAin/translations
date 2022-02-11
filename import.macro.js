const fs = require('fs');
const path = require('path');
// const yaml = require('js-yaml');
const { createMacro, MacroError } = require('babel-plugin-macros');
// const { addNamed } = require('@babel/helper-module-imports');

const EXTENSIONS = ['json', 'yaml'];

const DEFAULT_OPTIONS = {
    rootDir: 'translations',
    extension: 'yaml',
};

module.exports = createMacro(importer, {
    configName: 'fontawesome-svg-core'
});

function importer({ references, babel: { types }, config }) {
    const { rootDir: dir, extension, ...opts } = getOptions(config);
    const rootDir = path.resolve(process.cwd(), dir);

    Object.keys(references).forEach((host) => {
        references[host].forEach((node) => {
            if (canBeReplaced(types, node)) {
                node.parentPath.replaceWith(createNode(node))
            }
        });
    });

    function canBeReplaced(types, node) {
        const { parentPath } = node;
        checkArgumentsLength();
        checkHostArgument();
        checkOptionArgument();

        return true

        function checkArgumentsLength() {
            if (!parentPath.node.arguments) return;
            if (parentPath.node.arguments.length > 2) {
                throw parentPath.buildCodeFrameError(
                    `Received an invalid number of arguments (must be 0, 1 or 2)`,
                    MacroError
                );
            }
        }

        function checkHostArgument() {
            if (!parentPath.node.arguments) return;
            if (parentPath.node.arguments.length < 1) return;
            const argument = parentPath.node.arguments[0];
            const { value } = argument;
            if (types.isStringLiteral(argument)) {
                try {
                    const stat = fs.lstatSync(path.join(rootDir, value));
                    if (!stat.isDirectory()) {
                        throw new Error('Not a directory');
                    }
                } catch (error) {
                    throw parentPath.buildCodeFrameError(
                        `Host parameter must refer to a directory`,
                        MacroError
                    );
                }
            } else if (!types.isNullLiteral(argument)) {
                throw parentPath.buildCodeFrameError(
                    `Host parameter must be a string, null.`,
                    MacroError
                );
            }
        }

        function checkOptionArgument() {
            if (!parentPath.node.arguments) return;
            if (parentPath.node.arguments.length < 2) return;
            const argument = parentPath.node.arguments[1];
            if (!types.isObjectExpression(argument)) {
                throw parentPath.buildCodeFrameError(
                    `Second parameter must be an object with { domain?: string, locale?: string }`,
                    MacroError
                );
            }
            for (let idx = 0; idx < argument.properties.length; idx++) {
                const property = argument.properties[idx];
                if (!types.isStringLiteral(property.key) && !types.isIdentifier(property.key)) {
                    throw parentPath.buildCodeFrameError(
                        `Option ${property.key.value} is not processable.`,
                        MacroError
                    );
                }
                const value = types.isStringLiteral(property.key) ? property.key.value : property.key.name;
                if (!['domain', 'locale'].includes(value)) {
                    throw parentPath.buildCodeFrameError(
                        `Option ${value} must be either "${['domain', 'locale'].join('" or "')}".`,
                        MacroError
                    );
                }

                if (!types.isStringLiteral(property.value)) {
                    throw parentPath.buildCodeFrameError(
                        `Option ${value} must be a string.`,
                        MacroError
                    );
                }
            }
        }
    }

    function createNode(parentPath) {
        // const iconName = parentPath.parentPath.node.arguments[0].value;
        // const name = `fa${capitalize(camelCase(iconName))}`;
        // const importFrom = `${rootDir}/${}.${extension}`;
        //
        // return addNamed(parentPath, name, importFrom);

        function getDomain() {
            if (!parentPath.node.arguments) return opts.domain;
            if (parentPath.node.arguments.length < 2) return opts.domain;
            const property = parentPath.node.arguments[1].properties.find(((property) => (property.key.value || property.key.name) === 'domain'));
            if (property) return property.value;
            return opts.domain;
        }

        function getHost() {
            if (!parentPath.node.arguments) return opts.host;
            if (parentPath.node.arguments.length < 1) return opts.host;
            if (!types.isNullLiteral(parentPath.node.arguments[0])) {
                return parentPath.node.arguments[0].value;
            }
            return opts.host;
        }

        function getLocale() {
            if (!parentPath.node.arguments) return opts.locale;
            if (parentPath.node.arguments.length < 2) return opts.locale;
            const property = parentPath.node.arguments[1].properties.find(((property) => (property.key.value || property.key.name) === 'locale'));
            if (property) return property.value;
            return opts.locale;
        }
    }
}

const getOptions = (config = {}) => {
    const options = {
        ...DEFAULT_OPTIONS,
        ...config,
    };

    if (!EXTENSIONS.includes(options.extension)) {
        throw new Error(`Config extension must be either "${EXTENSIONS.join('" or "')}"`);
    }

    return options;
};
