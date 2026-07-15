import type { LocalizedText } from '../models/localizedText.js';
import type { TranslationLanguage } from '../constants/languages.js';

export const getLocalizedField = (field: LocalizedText, lang: TranslationLanguage): string =>
  field[lang] || field.en || '';
