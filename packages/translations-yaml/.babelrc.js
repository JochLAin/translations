module.exports = (api) => {
    const presets = [["@babel/preset-env", { "useBuiltIns": "entry", "corejs": 3 }]];
    const plugins = [];

    if (process.env.NODE_ENV === 'test' || api.env('test')) {
        plugins.push("macros");
    }

    api.cache(false);
    return {
        presets,
        plugins
    };
}
