import mongoose, { Schema, type Types } from 'mongoose';
import { localizedTextSchema, type LocalizedText } from '../../common/models/localizedText.js';
import { CATEGORY_SLUG_PATTERN } from './category.constants.js';

export interface CategoryAttrs {
  name: LocalizedText;
  slug: string;
  tagline?: LocalizedText;
  isActive: boolean;
}

export interface CategoryLean extends CategoryAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<CategoryAttrs>(
  {
    name: { type: localizedTextSchema, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: CATEGORY_SLUG_PATTERN,
    },
    tagline: { type: localizedTextSchema },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

categorySchema.index({ isActive: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
