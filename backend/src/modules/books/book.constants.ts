export const BOOK_GENRES = [
  'fiction',
  'non-fiction',
  'poetry',
  'religious',
  'children',
  'history',
  'science',
  'other',
] as const;

export const BOOK_LANGUAGES = ['english', 'urdu', 'persian', 'arabic', 'other'] as const;

export type BookGenre = (typeof BOOK_GENRES)[number];
export type BookLanguage = (typeof BOOK_LANGUAGES)[number];

export {
  TRANSLATION_LANGUAGES,
  type TranslationLanguage,
} from '../../common/constants/languages.js';
