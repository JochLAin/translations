const TerserWebpackPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');

let config = {
    entry: './lib/index.ts',
    output: {
        filename: 'index.js',
        path: __dirname,
        library: pkg.name,
        libraryTarget: 'umd',
        globalObject: 'this',
        umdNamedDefine: true,
    },
    module: {
        rules: [{
            test: /\.ts/,
            exclude: /node_modules/,
            use: 'babel-loader',
        }]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
}

module.exports = (env, argv) => {
    if (argv.mode === 'production') {
        config.optimization = {
            minimize: true,
            minimizer: [
                new TerserWebpackPlugin({
                    parallel: true,
                })
            ]
        };
    }

    return config;
};