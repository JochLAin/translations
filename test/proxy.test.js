import Translator from '../index';

test('Getter catalogs', () => {
    const translator = Translator({
        en: { messages: { hello: 'Hello' } },
        fr: { messages: { hello: 'Bonjour' } }
    });

    expect(translator.catalogs).toBeInstanceOf(Map);
});

test('Getter translations', () => {
    const translator = Translator({
        en: { messages: { hello: 'Hello' } },
        fr: { messages: { hello: 'Bonjour' } }
    });

    expect(translator.translations).not.toBeInstanceOf(Map);
    expect(translator.translations).not.toBeUndefined();
});
