import type { Model, Types } from 'mongoose';
import Book, { type BookLean } from '../books/book.model.js';
import Product, { type ProductLean } from '../products/product.model.js';
import {
  DEFAULT_SHIPPING_CLASS,
  type ItemType,
  type ShippingClass,
} from '../../common/constants/catalog.js';
import type { StockFields } from '../../common/utils/stock.js';

export interface ItemRef {
  itemType: ItemType;
  itemId: string;
}

// A book or a product, flattened into the fields carts, orders and stock
// management care about.
export interface CatalogItem {
  itemType: ItemType;
  _id: Types.ObjectId;
  title: string;
  // Author for books, category name for products.
  subtitle: string;
  price: number;
  coverImageUrl: string | null;
  isAvailable: boolean;
  stock: number | null;
  lowStockThreshold: number | null;
  // Already resolved: the item's own class, else its category's, else the default.
  shippingClass: ShippingClass;
}

export const fromBook = (book: BookLean): CatalogItem => ({
  itemType: 'book',
  _id: book._id,
  title: book.title.en,
  subtitle: book.author,
  price: book.price,
  coverImageUrl: book.coverImage?.url ?? null,
  isAvailable: book.isAvailable,
  stock: book.stock ?? null,
  lowStockThreshold: book.lowStockThreshold ?? null,
  shippingClass: book.shippingClass ?? DEFAULT_SHIPPING_CLASS,
});

export const fromProduct = (product: ProductLean): CatalogItem => ({
  itemType: 'product',
  _id: product._id,
  title: product.name.en,
  subtitle: product.category?.name?.en ?? '',
  price: product.price,
  coverImageUrl: product.coverImage?.url ?? null,
  isAvailable: product.isAvailable,
  stock: product.stock ?? null,
  lowStockThreshold: product.lowStockThreshold ?? null,
  shippingClass: product.shippingClass ?? product.category?.shippingClass ?? DEFAULT_SHIPPING_CLASS,
});

// Stock lives on the Book/Product documents themselves; both share the same
// stock fields, so stock operations can treat them as one model shape.
export const stockModelFor = (itemType: ItemType): Model<StockFields> =>
  (itemType === 'book' ? Book : Product) as unknown as Model<StockFields>;

export const itemKey = (ref: { itemType: ItemType; itemId: string }): string =>
  `${ref.itemType}:${ref.itemId}`;

// Loads every referenced item in two queries. Missing items are simply absent
// from the returned map.
export const loadCatalogItems = async (refs: ItemRef[]): Promise<Map<string, CatalogItem>> => {
  const bookIds = refs.filter((ref) => ref.itemType === 'book').map((ref) => ref.itemId);
  const productIds = refs.filter((ref) => ref.itemType === 'product').map((ref) => ref.itemId);

  const [books, products] = await Promise.all([
    bookIds.length
      ? Book.find({ _id: { $in: bookIds } })
          .lean<BookLean[]>()
          .exec()
      : Promise.resolve([]),
    productIds.length
      ? Product.find({ _id: { $in: productIds } })
          .populate('category')
          .lean<ProductLean[]>()
          .exec()
      : Promise.resolve([]),
  ]);

  const items = new Map<string, CatalogItem>();
  for (const book of books) items.set(`book:${book._id.toString()}`, fromBook(book));
  for (const product of products) {
    items.set(`product:${product._id.toString()}`, fromProduct(product));
  }
  return items;
};

export const loadCatalogItem = async (ref: ItemRef): Promise<CatalogItem | null> =>
  (await loadCatalogItems([ref])).get(itemKey(ref)) ?? null;

export const loadAllCatalogItems = async (): Promise<CatalogItem[]> => {
  const [books, products] = await Promise.all([
    Book.find().sort({ 'title.en': 1 }).lean<BookLean[]>().exec(),
    Product.find().sort({ 'name.en': 1 }).populate('category').lean<ProductLean[]>().exec(),
  ]);
  return [...books.map(fromBook), ...products.map(fromProduct)];
};
