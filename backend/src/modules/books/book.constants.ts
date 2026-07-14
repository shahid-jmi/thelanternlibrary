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
export const TRANSLATION_LANGUAGES = ['en', 'ur'] as const;

export type BookGenre = (typeof BOOK_GENRES)[number];
export type BookLanguage = (typeof BOOK_LANGUAGES)[number];
export type TranslationLanguage = (typeof TRANSLATION_LANGUAGES)[number];

// TODO: temporary stand-in placeholder (no R2 credentials were available to upload a real
// hosted placeholder at implementation time). Replace with an R2-hosted asset (served from
// R2_PUBLIC_URL, same as real uploads) once credentials are configured.
export const PLACEHOLDER_COVER_URL =
  'https://placehold.co/400x600/e2e8f0/64748b?text=No+Cover+Available';
