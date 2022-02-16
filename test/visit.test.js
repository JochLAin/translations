const { getCatalogValue } = require("../index");
const CATALOG = require("./constant");

test('Visit catalog method', () => {
    expect(getCatalogValue(CATALOG['en']['messages'], 'hello')).toBe('Hello');
    expect(getCatalogValue(CATALOG['en']['messages'], 'translations.are.incredible')).toBe('The translations are incredible.');
    expect(getCatalogValue(CATALOG['en']['messages'], 'very.compound.key')).toBe('The compound key');
});
