export const TRANSLATION_LANGUAGES = ['en', 'ur'] as const;

export type TranslationLanguage = (typeof TRANSLATION_LANGUAGES)[number];
