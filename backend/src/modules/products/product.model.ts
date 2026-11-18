import mongoose, { Schema, type Types } from 'mongoose';
import { localizedTextSchema, type LocalizedText } from '../../common/models/localizedText.js';
import { coverImageSchema, type CoverImage } from '../../common/models/coverImage.js';
import type { CategoryLean } from '../categories/category.model.js';
import { SHIPPING_CLASSES, type ShippingClass } from '../../common/constants/catalog.js';

export interface ProductAttrs {
  name: LocalizedText;
  description: LocalizedText;
  category: Types.ObjectId;
  price: number;
  coverImage: CoverImage;
  isAvailable: boolean;
  isFeatured: boolean;
  // null = not tracking stock for this product yet (always orderable).
  stock: number | null;
  // null = use the store-wide default from settings.
  lowStockThreshold: number | null;
  // null = inherit the category's shipping class.
  shippingClass: ShippingClass | null;
}

// Repository reads always populate `category`, so lean products carry the full
// category document rather than a bare ObjectId.
export interface ProductLean extends Omit<ProductAttrs, 'category'> {
  _id: Types.ObjectId;
  category: CategoryLean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductAttrs>(
  {
    name: { type: localizedTextSchema, required: true },
    description: { type: localizedTextSchema, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    coverImage: { type: coverImageSchema, required: true },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    stock: { type: Number, default: null, min: 0 },
    lowStockThreshold: { type: Number, default: null, min: 0 },
    shippingClass: { type: String, enum: [...SHIPPING_CLASSES, null], default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ 'name.en': 1 });
productSchema.index({ stock: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
