import Translator from '../index.min.js';

test('Default export as method', () => {
    const translator = Translator({
        en: { messages: { hello: 'Hello' } },
        fr: { messages: { hello: 'Bonjour' } }
    });

    expect(translator.translate('hello')).toBe('Hello'); // => "Hello"
    expect(translator.translate('hello', null, null, 'fr')).toBe('Bonjour'); // => "Hello"
});

test('Default export as constructor', () => {
    const translations = new Map();
    translations.set('messages-en', { hello: 'Hello' });
    translations.set('messages-fr', { hello: 'Bonjour' });

    const translator = new Translator(translations);
    expect(translator.translate('hello')).toBe('Hello');
    expect(translator.translate('hello', null, null, 'fr')).toBe('Bonjour');
});

test('Other proxy method', () => {
    expect(() => Translator.test = true).toThrow('It\'s not allowed to add a property to Translator class, please use a composition relation instead.');
    expect(Translator.create).toBeInstanceOf(Function);
});
