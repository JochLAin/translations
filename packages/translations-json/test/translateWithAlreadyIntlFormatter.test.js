import IntlMessageFormat from "intl-messageformat";
import { translate } from "../macro";

const formatter = { format: (message, replacements, locale) => String((new IntlMessageFormat(message, locale)).format(replacements)) };
const locale = 'fr';

test('Translate macro with already module imported and formatter created', () => {
  expect(translate('diff.ago.year', { count: 1 }, { domain: 'times' })).toBe('1 year ago');
  expect(translate('diff.ago.year', { count: 2 }, { domain: 'times' })).toBe('2 years ago');

  expect(translate('diff.ago.year', { count: 1 }, { domain: 'times', locale: 'fr' })).toBe('il y a 1 an');
  expect(translate('diff.ago.year', { count: 2 }, { domain: 'times', locale: 'fr' })).toBe('il y a 2 ans');

  expect(translate('diff.ago.year', { count: 1 }, { domain: 'times', locale })).toBe('il y a 1 an');
  expect(translate('diff.ago.year', { count: 2 }, { domain: 'times', locale })).toBe('il y a 2 ans');
});
