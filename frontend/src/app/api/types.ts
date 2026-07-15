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

export interface CoverImage {
  url: string;
  key: string | null;
}

export interface PublicBook {
  _id: string;
  title: string;
  description: string;
  author: string;
  price: number;
  genre: BookGenre;
  language: BookLanguage;
  coverImage: CoverImage;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocalizedText {
  en: string;
  ur?: string;
}

export interface AdminBook extends Omit<PublicBook, 'title' | 'description'> {
  title: LocalizedText;
  description: LocalizedText;
}

export interface BookPayload {
  title: LocalizedText;
  description: LocalizedText;
  author: string;
  price: number;
  genre: BookGenre;
  language: BookLanguage;
  isAvailable: boolean;
}

export interface BookFilters {
  lang?: string;
  search?: string;
  genre?: string;
  language?: string;
  available?: string;
}

export interface PublicCategory {
  _id: string;
  name: string;
  slug: string;
  tagline: string | null;
}

export interface AdminCategory {
  _id: string;
  name: LocalizedText;
  slug: string;
  tagline: LocalizedText | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPayload {
  name: LocalizedText;
  slug: string;
  tagline?: LocalizedText;
  isActive: boolean;
}

export interface PublicProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  coverImage: CoverImage;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProduct extends Omit<PublicProduct, 'name' | 'description' | 'category'> {
  name: LocalizedText;
  description: LocalizedText;
  category: {
    _id: string;
    name: LocalizedText;
    slug: string;
    isActive: boolean;
  };
}

export interface ProductPayload {
  name: LocalizedText;
  description: LocalizedText;
  category: string;
  price: number;
  isAvailable: boolean;
}

export interface ProductFilters {
  lang?: string;
  category?: string;
  available?: string;
  search?: string;
}

export const ADMIN_ROLES = ['admin', 'super_admin'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface AdminAccount {
  _id: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdBy: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminPayload {
  email: string;
  password: string;
  role: AdminRole;
}
