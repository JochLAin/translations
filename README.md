# @jochlain/translations

Translation module that support **Intl** format
Can work with Symfony in Node or with Webpack (Encore)

## Installation

```shell
npm install --save @jochlain/translations
```

## Usage

<details>
    <summary><b>Translations catalog example</b></summary>

```javascript
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
```
</details>

```javascript
import createIntlTranslator from "@jochlain/translations";

const translator = createIntlTranslator(CATALOG);
console.log(translator.translate('hello')); // => "Hello"

console.log(translator.translate('hello', null, null, 'fr')); // => "Bonjour"
console.log(translator.translate('hello', null, null, 'ar')); // => "hello"

console.log(translator.translate('This field is required.', null, 'forms', 'fr')); // => "Ce champs est obligatoire."
console.log(translator.translate('This field is required.', null, 'validators', 'fr')); // => "This field is required."

const translatorTimesEn = translator.withDomain('times');
const translatorTimesFr = translatorTimesEn.withLocale('fr');

console.log(translatorTimesEn.translate('diff.ago.year', { count: 1 })); // => "1 year ago"
console.log(translatorTimesEn.translate('diff.ago.year', { count: 2 })); // => "2 years ago"
console.log(translatorTimesFr.translate('diff.ago.year', { count: 1 })); // => "il y a 1 an"
console.log(translatorTimesFr.translate('diff.ago.year', { count: 2 })); // => "il y a 2 ans"
```

For more usage sample see [Jest test](https://github.com/JochLAin/translations/blob/main/test/index.test.js)

## Load translation file (front / back)

Due to security breach with dynamic require filename, module can't perform this for you.  
But a webpack plugin can : [@jochlain/webpack-plugin-translations]()

### Add loader for file extension

#### Add babel plugin to work in node

I'm working on babel plugin to load translation file directly in node

- JSON is native
- [@jochlain/babel-plugin-yaml](https://www.npmjs.com/package/@jochlain/babel-plugin-yaml)
- ...

#### Add wepback configuration to work with

[How to add loader to Webpack Encore](https://symfony.com/doc/current/frontend/encore/custom-loaders-plugins.html)

- [JSON loader](https://v4.webpack.js.org/loaders/json-loader/)
- [YAML loader](https://www.npmjs.com/package/yaml-loader)
- ...

### Build your translator

> Use [@jochlain/webpack-plugin-translations]() to generate file on compilation or create your own

```javascript
// assets/translator.js

import createIntlTranslator from "@jochlain/translations";
import formsEn from "../translations/forms.en.yaml";
import formsFr from "../translations/forms.fr.yaml";
import formsEn from "../translations/forms.en.yaml";
import formsFr from "../translations/forms.fr.yaml";

const translator = createIntlTranslator();
translator.addCatalog(formsEn, 'forms', 'en');
translator.addCatalog(formsFr, 'forms', 'fr');
translator.addCatalog(messagesEn, 'messages', 'en');
translator.addCatalog(messagesFr, 'messages', 'fr');

export default translator;
export const trans = translator.translate;
```

### Use your translator

```javascript
// assets/index.js

import { trans } from "./translator";

console.log(trans('hello'));
```
