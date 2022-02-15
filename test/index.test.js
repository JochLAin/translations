import Translator, { translate } from '../lib';
import CATALOG from './constant';

test('Simple translations with domain parameter', () => {
    const translator = Translator(CATALOG);
    expect(translator.translate('This field is required.', null, 'forms')).toBe(CATALOG.en.forms["This field is required."]); // => "This field is required."
    expect(translator.translate('This field is required.', null, 'forms', 'fr')).toBe(CATALOG.fr.forms["This field is required."]); // => "Ce champs est obligatoire."
});

test('Simple translations with unknown domain parameter', () => {
    const translator = Translator(CATALOG);
    expect(translator.translate('hello', null, 'validators')).toBe('hello');
});

test('Simple translations with uninformed locale parameter', () => {
    const translator = Translator(CATALOG);
    expect(translator.translate('hello', null, null, 'ar')).toBe('hello');
});

test('Simple translations with default locale', () => {
    const translator = Translator(CATALOG, { locale: 'fr' });

    expect(translator.translate('hello')).toBe(CATALOG.fr.messages.hello); // => "Bonjour"
    expect(translator.translate('hello', null, null, 'en')).toBe(CATALOG.en.messages.hello); // => "Hello"
    expect(translator.translate('hello', null, null, 'it')).toBe(CATALOG.it.messages.hello); // => "Ciao"
    expect(translator.translate('hello', null, null, 'ar')).toBe('hello');
});

test('Simple translation with helpers', () => {
    const translator = Translator(CATALOG);
    expect(translator.translate('hello')).toBe(CATALOG.en.messages.hello); // => "Hello"
    expect(translator.withLocale('fr').translate('hello')).toBe(CATALOG.fr.messages.hello); // => "Bonjour"
    expect(translator.withDomain('forms').translate('This field is required.')).toBe(CATALOG.en.forms['This field is required.']); // => "This field is required."
    expect(translator.with({ domain: 'forms', locale: 'fr' }).translate('This field is required.')).toBe(CATALOG.fr.forms['This field is required.']); // => "Ce champs est obligatoire."
});

test('Compound key translations', () => {
    const translator = Translator(CATALOG);
    expect(translator.translate('very.compound.key')).toBe(CATALOG.en.messages.very.compound.key); // => "The compound key"
    expect(translator.withLocale('fr').translate('very.compound.key')).toBe(CATALOG.fr.messages.very.compound.key); // => "La clé composée"
});

test('Fake compound key translations', () => {
    const translator = Translator(CATALOG);
    expect(translator.translate('translations.are.incredible')).toBe(CATALOG.en.messages['translations.are.incredible']); // => "The translations are incredible."
    expect(translator.withLocale('fr').translate('translations.are.incredible')).toBe(CATALOG.fr.messages['translations.are.incredible']); // => "Les traductions sont incroyables."
});

test('Parameter translations', () => {
    const translator = Translator(CATALOG);
    expect(translator.translate('helloYou', { '%name%': "Tony" })).toBe('Hello Tony');
});

test('Static translations', () => {
    expect(translate({ en: 'Hello', fr: 'Bonjour' })).toBe('Hello');
    expect(translate({ en: 'Hello', fr: 'Bonjour' }, null, 'fr')).toBe('Bonjour');
});
