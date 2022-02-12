const { default: create, translate } = require('../lib');

const CATALOG = {
    en: {
        messages: {
            hello: "Hello",
            "translations.are.incredible": 'The translations are incredible.',
            very: { compound: { key: "The compound key" } },
        },
        forms: {
            "This field is required.": "This field is required."
        },
        times: {
            diff: {
                empty: "now",
                ago: {
                    year: "{count, plural, one {1 year ago} other {# years ago}}",
                    month: "{count, plural, one {1 month ago} other {# months ago}}",
                    day: "{count, plural, one {1 day ago} other {# days ago}}",
                    hour: "{count, plural, one {1 hour ago} other {# hours ago}}",
                    minute: "{count, plural, one {1 minute ago} other {# minutes ago}}",
                    second: "{count, plural, one {1 second ago} other {# seconds ago}}",
                },
                in: {
                    second: "{count, plural, one {in 1 second} other {in # seconds}}",
                    minute: "{count, plural, one {in 1 minute} other {in # minutes}}",
                    hour: "{count, plural, one {in 1 hour} other {in # hours}}",
                    day: "{count, plural, one {in 1 day} other {in # days}}",
                    month: "{count, plural, one {in 1 month} other {in # months}}",
                    year: "{count, plural, one {in 1 year} other {in # years}}",
                },
            }
        }
    },
    es: {
        messages: {
            hello: "Holà",
            "translations.are.incredible": 'Las traducciones son increíbles.',
            very: { compound: { key: "La llave compuesta" } },
        },
        forms: {
            "This field is required.": "Este campo es obligatorio.",
        },
        times: {
            diff: {
                empty: "ahora",
                ago: {
                    year: "{count, plural, one {hace 1 año} other {hace # años}}",
                    month: "{count, plural, one {hace 1 mes} other {hace # meses}}",
                    day: "{count, plural, one {hace 1 día} other {hace # días}}",
                    hour: "{count, plural, one {hace 1 hora} other {hace # horas}}",
                    minute: "{count, plural, one {hace 1 minuto} other {hace # minutos}}",
                    second: "{count, plural, one {hace 1 segundo} other {hace # segundos}}",
                },
                in: {
                    second: "{count, plural, one {en 1 segundo} other {en # segundos}}",
                    minute: "{count, plural, one {en 1 minuto} other {en # minutos}}",
                    hour: "{count, plural, one {en 1 hora} other {en # horas}}",
                    day: "{count, plural, one {en 1 día} other {en # días}}",
                    month: "{count, plural, one {en 1 mes} other {en # meses}}",
                    year: "{count, plural, one {en 1 año} other {en # años}}",
                },
            },
        },
    },
    fr: {
        messages: {
            hello: "Bonjour",
            "translations.are.incredible": "Les traductions sont incroyables.",
            very: { compound: { key: "La clé composée" } },
        },
        forms: {
            "This field is required.": "Ce champs est obligatoire.",
        },
        times: {
            diff: {
                empty: "maintenant",
                ago: {
                    year: "{count, plural, one {il y a 1 an} other {il y a # ans}}",
                    month: "{count, plural, one {il y a 1 mois} other {il y a # mois}}",
                    day: "{count, plural, one {il y a 1 jour} other {il y a # jours}}",
                    hour: "{count, plural, one {il y a 1 heure} other {il y a # heures}}",
                    minute: "{count, plural, one {il y a 1 minute} other {il y a # minutes}}",
                    second: "{count, plural, one {il y a 1 seconde} other {il y a # secondes}}",
                },
                in: {
                    second: "{count, plural, one {dans 1 seconde} other {dans # secondes}}",
                    minute: "{count, plural, one {dans 1 minute} other {dans # minutes}}",
                    hour: "{count, plural, one {dans 1 heure} other {dans # heures}}",
                    day: "{count, plural, one {dans 1 jour} other {dans # jours}}",
                    month: "{count, plural, one {dans 1 mois} other {dans # mois}}",
                    year: "{count, plural, one {dans 1 an} other {dans # ans}}",
                }
            }
        }
    },
    it: {
        messages: {
            hello: "Ciao",
            "translations.are.incredible": 'Le traduzioni sono incredibili.',
            very: { compound: { key: "La chiave composta" } },
        },
        forms: {
            "This field is required.": "Questo campo è richiesto.",
        },
        times: {
            diff: {
                empty: "ahora",
                ago: {
                    year: "{count, plural, one {1 anno fa} other {# anni fa}}",
                    month: "{count, plural, one {1 mese fa} other {# mesi fa}}",
                    day: "{count, plural, one {1 giorno fa} other {# giorni fa}}",
                    hour: "{count, plural, one {1 ora fa} other {# ore fa}}",
                    minute: "{count, plural, one {1 minuto fa} other {# minut fa}}",
                    second: "{count, plural, one {1 secondo fa} other {# secondi fa}}",
                },
                in: {
                    second: "{count, plural, one {tra 1 secondo} other {tra # secondi}}",
                    minute: "{count, plural, one {tra 1 minuto} other {tra # minut}}",
                    hour: "{count, plural, one {tra 1 ora} other {tra # ore}}",
                    day: "{count, plural, one {tra 1 giorno} other {tra # giorni}}",
                    month: "{count, plural, one {tra 1 mese} other {tra # mesi}}",
                    year: "{count, plural, one {tra 1 anno} other {tra # anni}}",
                },
            },
        }
    },
};

test('Simplest translations', () => {
    const translator = create(CATALOG);

    expect(translator.translate('hello')).toBe(CATALOG.en.messages.hello);
});

test('Simple translations with locale parameter', () => {
    const translator = create(CATALOG);

    expect(translator.translate('hello', null, null, 'fr')).toBe(CATALOG.fr.messages.hello); // => "Hello"
});

test('Simple translations with domain parameter', () => {
    const translator = create(CATALOG);

    expect(translator.translate('This field is required.', null, 'forms')).toBe(CATALOG.en.forms["This field is required."]); // => "This field is required."
    expect(translator.translate('This field is required.', null, 'forms', 'fr')).toBe(CATALOG.fr.forms["This field is required."]); // => "Ce champs est obligatoire."
});

test('Simple translations with unknown domain parameter', () => {
    const translator = create(CATALOG);

    expect(translator.translate('hello', null, 'validators')).toBe('hello');
});

test('Simple translations with uninformed locale parameter', () => {
    const translator = create(CATALOG);

    expect(translator.translate('hello', null, null, 'ar')).toBe('hello');
});

test('Simple translations with default locale', () => {
    const translator = create(CATALOG, 'fr');

    expect(translator.translate('hello')).toBe(CATALOG.fr.messages.hello); // => "Bonjour"
    expect(translator.translate('hello', null, null, 'en')).toBe(CATALOG.en.messages.hello); // => "Hello"
    expect(translator.translate('hello', null, null, 'it')).toBe(CATALOG.it.messages.hello); // => "Ciao"
    expect(translator.translate('hello', null, null, 'ar')).toBe('hello');
});

test('Simple translation with helpers', () => {
    const translator = create(CATALOG);

    expect(translator.translate('hello')).toBe(CATALOG.en.messages.hello); // => "Hello"
    expect(translator.withLocale('fr').translate('hello')).toBe(CATALOG.fr.messages.hello); // => "Bonjour"
    expect(translator.withDomain('forms').translate('This field is required.')).toBe(CATALOG.en.forms['This field is required.']); // => "This field is required."
    expect(translator.with({ domain: 'forms', locale: 'fr' }).translate('This field is required.')).toBe(CATALOG.fr.forms['This field is required.']); // => "Ce champs est obligatoire."
});

test('Compound key translations', () => {
    const translator = create(CATALOG);

    expect(translator.translate('very.compound.key')).toBe(CATALOG.en.messages.very.compound.key); // => "The compound key"
    expect(translator.withLocale('fr').translate('very.compound.key')).toBe(CATALOG.fr.messages.very.compound.key); // => "La clé composée"
});

test('Fake compound key translations', () => {
    const translator = create(CATALOG);

    expect(translator.translate('translations.are.incredible')).toBe(CATALOG.en.messages['translations.are.incredible']); // => "The translations are incredible."
    expect(translator.withLocale('fr').translate('translations.are.incredible')).toBe(CATALOG.fr.messages['translations.are.incredible']); // => "Les traductions sont incroyables."
});

test('Plural translations', () => {
    const translator = create(CATALOG);
    const translatorEn = translator.withDomain('times');
    const translatorFr = translatorEn.withLocale('fr');

    expect(translatorEn.translate('diff.ago.year', { count: 1 })).toBe('1 year ago');
    expect(translatorEn.translate('diff.ago.year', { count: 2 })).toBe('2 years ago');
    expect(translatorFr.translate('diff.ago.year', { count: 1 })).toBe('il y a 1 an');
    expect(translatorFr.translate('diff.ago.year', { count: 2 })).toBe('il y a 2 ans');
});

test('Static translations', () => {
    expect(translate({ en: 'Hello', fr: 'Bonjour' })).toBe('Hello');
    expect(translate({ en: 'Hello', fr: 'Bonjour' }, null, 'fr')).toBe('Bonjour');
    expect(translate({ en: CATALOG.en.times.diff.ago.day, fr: CATALOG.fr.times.diff.ago.day }, { count: 1 })).toBe('1 day ago');
    expect(translate({ en: CATALOG.en.times.diff.ago.day, fr: CATALOG.fr.times.diff.ago.day }, { count: 3 })).toBe('3 days ago');
    expect(translate({ en: CATALOG.en.times.diff.ago.day, fr: CATALOG.fr.times.diff.ago.day }, { count: 1 }, 'fr')).toBe('il y a 1 jour');
    expect(translate({ en: CATALOG.en.times.diff.ago.day, fr: CATALOG.fr.times.diff.ago.day }, { count: 3 }, 'fr')).toBe('il y a 3 jours');
});
