import { Translator } from "@jochlain/translations";

export function translate(key: string, replacements?: { [key: string]: number|string }, options?: { domain?: string, locale?: string, host?: string }): string;
export function createTranslator(options?: string|{ host?: string }): typeof Translator;
