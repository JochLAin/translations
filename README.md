# Translation module _@jochlain/translations_

<small>_Remove Intl support in order to remove all dependencies_</small>

### ⚠ Work in progress

Can work with Symfony in Node or with Webpack (Encore)  
See [how to integrate](https://www.npmjs.com/package/@jochlain/babel-macro-translations)

## Summary

- [Installation](#installation)
- [Usage](#usage)
- [Example of Intl integration](#intl-integration)

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
            hello: "Hi",
            "translations.are.incredible": 'The translations are incredible.',
            very: { compound: { key: "The compound key" } },
        },
        forms: {
            "This field is required.": "This field is required."
        },
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
    },
};
```
</details>

```javascript
import createTranslator from "@jochlain/translations";

const translator = createTranslator(CATALOG);
console.log(translator.translate('hello')); // => "Hi"
console.log(translator.translate('hello', null, null, 'fr')); // => "Bonjour"

// With unknown informations
console.log(translator.translate('hello', null, 'forms')); // => "hello"
console.log(translator.translate('hello', null, 'validators')); // => "hello"
console.log(translator.translate('hello', null, null, 'ar')); // => "hello"

// Compound key
console.log(translator.translate('very.compound.key')); // => "The compound key"
// Fake compound key
console.log(translator.translate('translations.are.incredible')); // => "The translations are incredible."

// Usage of with* helper
const translatorFormsEn = translator.withDomain('forms');
const translatorFormsFr = translatorFormsEn.withLocale('fr');

console.log(translatorFormsEn.translate('This field is required.')); // => "This field is required."
console.log(translatorFormsFr.translate('This field is required.')); // => "Ce champs est obligatoire."
```

For more usage sample see [Jest test](https://github.com/JochLAin/translations/blob/main/test/index.test.js)

## Intl integration

```javascript
import createTranslator from "@jochlain/translations";
import { IntlMessageFormat } from "intl-messageformat";

const formatter = { format: (message, replacements, locale) => (new IntlMessageFormat(message, locale).format(replacements)) };
const translator = createTranslator(CATALOG, { formatter });
```
