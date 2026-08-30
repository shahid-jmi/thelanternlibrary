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
  isFeatured: boolean;
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
  isFeatured: boolean;
}

export interface BookFilters {
  lang?: string;
  search?: string;
  genre?: string;
  language?: string;
  available?: string;
  featured?: string;
}

export interface PublicCategory {
  _id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  coverImage: CoverImage;
}

export interface AdminCategory {
  _id: string;
  name: LocalizedText;
  slug: string;
  tagline: LocalizedText | null;
  description: LocalizedText | null;
  coverImage: CoverImage;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPayload {
  name: LocalizedText;
  slug: string;
  tagline?: LocalizedText;
  description?: LocalizedText;
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
  isFeatured: boolean;
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
  isFeatured: boolean;
}

export interface ProductFilters {
  lang?: string;
  category?: string;
  available?: string;
  featured?: string;
  search?: string;
}

export const ORDER_STATUSES = ['pending', 'paid', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export interface CreateOrderPayload {
  book: string;
  customerName: string;
  customerPhone: string;
  customerAltPhone?: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  note?: string;
}

export interface PublicOrder {
  _id: string;
  status: OrderStatus;
  createdAt: string;
}

export interface AdminOrderBook {
  _id: string;
  title: string;
  coverImage: CoverImage;
}

export interface AdminOrder {
  _id: string;
  book: AdminOrderBook | null;
  bookTitle: string;
  bookAuthor: string;
  price: number;
  deliveryCharge: number;
  customerName: string;
  customerPhone: string;
  customerAltPhone: string | null;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  note: string | null;
  status: OrderStatus;
  invoiceNumber: string | null;
  invoiceGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  sort?: 'newest' | 'oldest';
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
  mustChangePassword: boolean;
  passwordChangedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminPayload {
  email: string;
  password: string;
  role: AdminRole;
}
