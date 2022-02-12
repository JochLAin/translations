# @jochlain/translations

Translation module that support **Intl** format  

Can work with Symfony in Node or with Webpack (Encore)  
See [how to integrate](#real-life-project)

## Summary

- [Installation](#installation)
- [Usage](#usage)
- [Real-life project](#real-life-project)
- [Work with host scope](#work-with-host-scope)

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

## Real-life project

# [**_Work in progress the code below does not work_**](#real-life-project)

> **Disclaimer :** This part is strongly inspired from [babel macros from fontawesome](https://fontawesome.com/docs/web/use-with/react/add-icons)

In a real project, translations are not simple objects but files, like in a [Symfony project](https://symfony.com/).  
That's why I added a [Babel macro](https://www.npmjs.com/package/babel-plugin-macros) to import and format these same files.

It allows you to create a translator and use it easily, with node, with webpack or in server-side rendering.  
I'll take the example of a Symfony project to be more concrete.

<details>
    <summary><b>translations/messages.en.yaml</b></summary>

```yaml
hello: "Hello"
awesome: "Awesome"
```
</details>

<details>
    <summary><b>translations/messages.fr.yaml</b></summary>

```yaml
hello: "Bonjour"
awesome: "Incroyable"
```
</details>

<details>
    <summary><b>translations/forms.en.yaml</b></summary>

```yaml
required: "required"
```
</details>

<details>
    <summary><b>translations/forms.fr.yaml</b></summary>

```yaml
required: "obligatoire"
```
</details>

### Install the babel macros

```shell
npm install --save babel-plugin-macros
```

### Setup babel configuration

Next, you'll need to configure the babel plugins. Add the following to your `.babelrc.js` file:

```javascript
module.exports = function (api) {
    //...
    return {
        // ...
        plugins: [
            // ...
            'macros',
        ],
    };
};
```

Then, create `babel-plugin-macros.config.js` file and add the `@jochlain/translations` settings.
You can set the `rootDir` and `extension` used for translations.

```javascript
module.exports = {
    '@jochlain/translations': {
        rootDir: 'translations',
        extension: 'yaml',
    },
};
```

_(I fill it with default values)_

### Add translations to your project

Then you can add your translations use the syntax below wherever you want then to appear in your project.

```javascript
import createTranslator from "@jochlain/translations/import.macro";

const translator = createTranslator();
translator.translate('hello') // => "Hello"
translator.translate('required', null, 'forms', 'fr') // => "obligatoire"

// Only specific domain
const translator = createTranslator(null || undefined, { domain: 'messages' });
translator.translate('awesome'); // => "Awesome"
translator.translate('required', null, 'forms') // => "required"

// Only specific locale
const translator = createTranslator(null || undefined, { locale: 'fr' });
translator.translate('awesome'); // => "Incroyable"
translator.translate('required', null, 'forms') // => "obligatoire"
```

### Work with host scope

Imagine you have a project with a frontend and a backend, and frontend must not be able to access backend translations.

Host is directory path between `rootDir` and translation files.  
If `rootDir` is `translations` and translation file is under `translations/front/blog/messages.en.yaml` then `host` is `front/blog`

<details>
    <summary><b>translations/back/message.en.yaml</b></summary>

```yaml
"some back message": "it's private"
```
</details>

<details>
    <summary><b>translations/front/message.en.yaml</b></summary>

```yaml
"some front message": "it's public"
```
</details>

And call them like below.

```javascript
import createTranslator from "@jochlain/translations/import.macro";

const translatorFront = createTranslator('front');
translatorFront.translate('some back message') // => "some back message"
translatorFront.translate('some front message') // => "it's public"
```

```javascript
import createTranslator from "@jochlain/translations/import.macro";

const translatorBack = createTranslator('back');
const translatorFront = createTranslator('front', { domain: 'messages', locale: 'en' });

translatorBack.translate('some back message') // => "it's private"
translatorBack.translate('some front message') // => "some front message"
translatorFront.translate('some front message') // => "it's public"
```

### Good practices

In order to keep good performance, you can create a file by domain which can be included after by your different components.  
This avoids loading the files several times

```javascript
// ./assets/translators/index.js
import createTranslator from "@jochlain/translations/import.macro";

export default createTranslator('front');
```

```javascript
// ./assets/translators/back.js
import createTranslator from "@jochlain/translations/import.macro";

export default createTranslator('back');
```

```javascript
//./assets/views/index.js
import translator from '../translators';
translatorFront.translate('some front message') // => "it's public"
```

```javascript
//./assets/views/back/index.js
import translatorFront from '../../translators';
import translatorBack from '../../translators/back';

translatorFront.translate('some front message') // => "it's public"
translatorBack.translate('some back message') // => "it's private"
```
