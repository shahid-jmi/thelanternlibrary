import type { FilterQuery } from 'mongoose';
import Product, { type ProductAttrs, type ProductLean } from './product.model.js';
import type { CoverImage } from '../../common/models/coverImage.js';
import type { LocalizedText } from '../../common/models/localizedText.js';

export interface CreateProductPayload {
  name: LocalizedText;
  description: LocalizedText;
  category: string;
  price: number;
  coverImage: CoverImage;
  isAvailable: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export const findPublicProducts = async (
  query: FilterQuery<ProductAttrs>
): Promise<ProductLean[]> =>
  Product.find(query).sort({ createdAt: -1 }).populate('category').lean<ProductLean[]>().exec();

export const findById = async (id: string): Promise<ProductLean | null> =>
  Product.findById(id).populate('category').lean<ProductLean>().exec();

export const findAdminProducts = async (): Promise<ProductLean[]> =>
  Product.find().sort({ createdAt: -1 }).populate('category').lean<ProductLean[]>().exec();

export const createProduct = async (payload: CreateProductPayload): Promise<ProductLean> => {
  const created = await Product.create(payload);
  const product = await findById(created._id.toString());

  if (!product) {
    throw new Error('Failed to load created product');
  }

  return product;
};

export const updateProductById = async (
  id: string,
  payload: UpdateProductPayload
): Promise<ProductLean | null> =>
  Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate('category')
    .lean<ProductLean>()
    .exec();

export const deleteProductById = async (id: string): Promise<ProductLean | null> =>
  Product.findByIdAndDelete(id).populate('category').lean<ProductLean>().exec();

export const updateAvailabilityById = async (
  id: string,
  isAvailable: boolean
): Promise<ProductLean | null> =>
  Product.findByIdAndUpdate(
    id,
    { isAvailable },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate('category')
    .lean<ProductLean>()
    .exec();

export const countByCategoryId = async (categoryId: string): Promise<number> =>
  Product.countDocuments({ category: categoryId }).exec();
