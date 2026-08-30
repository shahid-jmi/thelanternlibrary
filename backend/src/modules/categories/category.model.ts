import mongoose, { Schema, type Types } from 'mongoose';
import { localizedTextSchema, type LocalizedText } from '../../common/models/localizedText.js';
import { coverImageSchema, type CoverImage } from '../../common/models/coverImage.js';
import { CATEGORY_SLUG_PATTERN } from './category.constants.js';

export interface CategoryAttrs {
  name: LocalizedText;
  slug: string;
  tagline?: LocalizedText;
  // Longer copy shown on the category's own detail page (above its product
  // grid) — tagline is the short line shown on the homepage tile.
  description?: LocalizedText;
  // Optional (not `required`) because categories created before this field
  // existed have no coverImage stored — .lean() reads don't retroactively
  // apply schema defaults, so callers must fall back defensively (see
  // category.mapper.ts). New categories always get one, real or placeholder.
  coverImage?: CoverImage;
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
    description: { type: localizedTextSchema },
    coverImage: { type: coverImageSchema },
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
