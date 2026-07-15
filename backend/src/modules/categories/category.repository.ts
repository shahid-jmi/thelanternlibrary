import Category, { type CategoryAttrs, type CategoryLean } from './category.model.js';

export const findActiveCategories = async (): Promise<CategoryLean[]> =>
  Category.find({ isActive: true }).sort({ createdAt: 1 }).lean<CategoryLean[]>().exec();

export const findAllCategories = async (): Promise<CategoryLean[]> =>
  Category.find().sort({ createdAt: 1 }).lean<CategoryLean[]>().exec();

export const findById = async (id: string): Promise<CategoryLean | null> =>
  Category.findById(id).lean<CategoryLean>().exec();

export const findBySlug = async (slug: string): Promise<CategoryLean | null> =>
  Category.findOne({ slug }).lean<CategoryLean>().exec();

export const createCategory = async (
  payload: CategoryAttrs | Omit<CategoryAttrs, 'isActive'>
): Promise<CategoryLean> => {
  const created = await Category.create(payload);
  return created.toObject() as unknown as CategoryLean;
};

export const updateCategoryById = async (
  id: string,
  payload: Partial<CategoryAttrs>
): Promise<CategoryLean | null> =>
  Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .lean<CategoryLean>()
    .exec();

export const deleteCategoryById = async (id: string): Promise<CategoryLean | null> =>
  Category.findByIdAndDelete(id).lean<CategoryLean>().exec();
