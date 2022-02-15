# Translation module

Can work with Symfony translations structure in Node environment and/or with Webpack using Babel.  
See how to integrate with :
- [YAML files](https://www.npmjs.com/package/@jochlain/translations-yaml)
- [JSON files](https://www.npmjs.com/package/@jochlain/translations-json)

## Summary

- [Installation](#installation)
- [Usage](#usage)
- [Example with Intl integration](#intl-integration)
- [Documentation](#documentation)
  - [Constant](#constants)
  - [Types](#types)
  - [Module](#module)
  - [Translator class](#translator-class)
    - [Members](#members)
    - [Static methods](#static-methods)
    - [Methods](#methods)
  - [Default format method](#default-format-method)

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
import Translator, { translate } from "@jochlain/translations";

const translator = Translator(CATALOG);
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

console.log(translate({ en: 'Hello', fr: 'Bonjour' })); // => "Hello"
console.log(translate({ en: 'Hello', fr: 'Bonjour' }, null, 'fr')); // => "Bonjour"
```

For more usage sample see [Jest test](https://github.com/JochLAin/translations/blob/main/test/)

## Intl integration

### Installation

`npm i -S intl-messageformat`

### Usage

```javascript
import Translator from "@jochlain/translations";
import { IntlMessageFormat } from "intl-messageformat";

const formatter = { format: (message, replacements, locale) => (new IntlMessageFormat(message, locale).format(replacements)) };
const translator = Translator(CATALOG, { formatter });
```

## Documentation

### Types

```typescript
type ReplacementType = { [key: string]: number|string };

type FormatType = (message: string, replacements: ReplacementType, locale: string) => string;  
type FormatterType = { format: FormatType };

type CatalogType = { [key: string]: string|CatalogType };  
type TranslationType = { [locale: string]: { [domain: string]: CatalogType } };

type OptionsType = { locale?: string, domain?: string, formatter?: FormatterType };
```

### Constants

```javascript
DEFAULT_DOMAIN="messages"  
DEFAULT_LOCALE="en"
```

### Module

| Name                         | Type                                   | Description                                                                           |
|------------------------------|----------------------------------------|---------------------------------------------------------------------------------------|
| default                      | Proxy<[Translator](#translator-class)> | If call like a function it calls create static method, else is the Translation class. |
| [DEFAULT_DOMAIN](#constants) | string                                 | Module constant                                                                       |
| [DEFAULT_LOCALE](#constants) | string                                 | Module constant                                                                       |
| Translator                   | Proxy<[Translator](#translator-class)> | The default export of the module                                                      |
| createTranslator             | Function                               | Static method [create](#static-method-create)                                         |
| formatMessage                | Function                               | Default [format method](#default-format-method)                                       |
| getCatalogValue              | Function                               | Static method [getCatalogValue](#static-method-getCatalogValue)                       |
| mergeCatalogs                | Function                               | Static method [mergeCatalogs](#static-method-mergeCatalogs)                           |
| translate                    | Function                               | Static method [translate](#static-method-translate)                                   |

### Translator class

#### Members

| Name           | Type                               | Default                                                      | Description                                  |
|----------------|------------------------------------|--------------------------------------------------------------|----------------------------------------------|
| fallbackDomain | string                             | `'messages'`                                                 | Default domain used in `translate`           |
| fallbackLocale | string                             | `'en'`                                                       | Default locale used in `translate`           |
| formatter      | [FormatterType](#types)            | <code>{ <a href="#default-format-method">format</a> }</code> | Formate message with locale and replacements |
| translations   | Map<string, [CatalogType](#types)> | `[]`                                                         | Translations catalog                         |

#### Static methods

<details id="static-method-create">
    <summary><code>create(translations, options)</code></summary>
    
Create Translator instance with another translations catalog format and set fallback values.

##### Parameters

| Name         | Type                      | Default | Description                                 |
|--------------|---------------------------|---------|---------------------------------------------|
| translations | [TranslationType](#types) | `{}`    | Translation catalogs by locale and domains  |
| options      | [OptionsType](#types)     | `{}`    | Options to set member default value         |

##### Return value

An instance of Translator.
</details>

<details id="static-method-getKey">
    <summary><code>getKey(domain, locale)</code></summary>

Format a key from domain and locale.

##### Parameters

| Name   | Type   |
|--------|--------|
| domain | string |
| locale | string |

##### Return value

A string representing the catalog key in translations map.
</details>

<details id="static-method-getCatalogValue">
    <summary><code>getCatalogValue(catalog, key)</code></summary>

Browse catalog to find value assigned to key

##### Parameters

| Name    | Type                                   |
|---------|----------------------------------------|
| catalog | [CatalogType](#types) &#124; undefined |
| key     | string                                 |

##### Return value

A string representing the key in catalog or the key if not found.
</details>

<details id="static-method-mergeCatalogs">
    <summary><code>mergeCatalogs(target, ...sources)</code></summary>

Deep merge many catalogs

##### Parameters

| Name    | Type                    |
|---------|-------------------------|
| target  | ?[CatalogType](#types)  |
| sources | [CatalogType](#types)[] |

##### Return value

A [CatalogType](#types) with merged values.
</details>

<details id="static-method-translate">
    <summary><code>translate(catalog, replacements, locale, formatter)</code></summary>

Translate a message from a simple catalog

##### Parameters

| Name         | Type                         | Default                                                      |
|--------------|------------------------------|--------------------------------------------------------------|
| catalog      | { [locale: string]: string } | {}                                                           |
| replacements | ?[ReplacementType](#types)   | {}                                                           |
| locale       | string                       | [DEFAULT_LOCALE](#constants)                                 |
| formatter    | [FormatterType](#types)      | <code>{ <a href="#default-format-method">format</a> }</code> |

##### Return value

A string representing the translated message.
</details>

### Methods

<details id="method-addCatalog">
    <summary><code>addCatalog(catalog, domain, locale)</code></summary>

Add a catalog to translations map

##### Parameters

| Name    | Type                  | Default                    |
|---------|-----------------------|----------------------------|
| catalog | [CatalogType](#types) | `{}`                       |
| locale  | string                | [fallbackLocale](#members) |
| domain  | string                | [fallbackDomain](#members) |

##### Return value

The Translator instance
</details>

<details id="method-getCatalog">
    <summary><code>getCatalog(domain, locale)</code></summary>

Get the catalog attach to domain and locale in translations map.  
If `locale` is like `en_US` it looks first for a `en_US` catalog and if not looks for a `en` catalog.

##### Parameters

| Name    | Type                  | Default                    |
|---------|-----------------------|----------------------------|
| locale  | string                | [fallbackLocale](#members) |
| domain  | string                | [fallbackDomain](#members) |

##### Return value

A [CatalogType](#types) or `undefined`
</details>

<details id="method-getMessage">
    <summary><code>getMessage(key, domain, locale)</code></summary>

Get message attach to key in catalog attach to domain and locale in translations.  
See [getCatalog](#method-getCatalog) and [getCatalogValue](#static-method-getCatalogValue)

##### Parameters

| Name   | Type                  | Default                    |
|--------|-----------------------|----------------------------|
| key    | string                | none                       |
| locale | string                | [fallbackLocale](#members) |
| domain | string                | [fallbackDomain](#members) |

##### Return value

A string if found or key.
</details>

<details id="method-setFallbackDomain">
    <summary><code>setFallbackDomain(domain)</code></summary>

Set the [fallbackDomain](#members) member

##### Parameters

| Name   | Type                  | Default                      |
|--------|-----------------------|------------------------------|
| domain | string                | [DEFAULT_DOMAIN](#constants) |

##### Return value

The Translator instance
</details>

<details id="method-setFallbackLocale">
    <summary><code>setFallbackLocale(locale)</code></summary>

Set the [fallbackLocale](#members) member

##### Parameters

| Name   | Type                  | Default                      |
|--------|-----------------------|------------------------------|
| locale | string                | [DEFAULT_LOCALE](#constants) |

##### Return value

The Translator instance
</details>

<details id="method-setFormatter">
    <summary><code>setFormatter(formatter)</code></summary>

Set the [formatter](#members) member

##### Parameters

| Name      | Type                    | Default                                                      |
|-----------|-------------------------|--------------------------------------------------------------|
| formatter | [FormatterType](#types) | <code>{ <a href="#default-format-method">format</a> }</code> |

##### Return value

The Translator instance
</details>

<details id="method-setTranslations">
    <summary><code>setTranslations(translations)</code></summary>

Set the [formatter](#members) member

##### Parameters

| Name      | Type                    | Default                                                      |
|-----------|-------------------------|--------------------------------------------------------------|
| formatter | [FormatterType](#types) | <code>{ <a href="#default-format-method">format</a> }</code> |

##### Return value

The Translator instance
</details>


### Default format method

