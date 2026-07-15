import type { Request, Response } from 'express';
import * as categoryService from './category.service.js';
import type { ListPublicCategoriesQuery, UpsertCategoryInput } from './category.validators.js';

export const listPublicCategories = async (req: Request, res: Response): Promise<void> => {
  const { lang } = req.query as unknown as ListPublicCategoriesQuery;
  const categories = await categoryService.listPublicCategories(lang);
  res.json(categories);
};

export const listAdminCategories = async (req: Request, res: Response): Promise<void> => {
  const categories = await categoryService.listAdminCategories();
  res.json(categories);
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await categoryService.createCategory(req.body as UpsertCategoryInput);
  res.status(201).json(category);
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await categoryService.updateCategory(
    req.params.id as string,
    req.body as UpsertCategoryInput
  );
  res.json(category);
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  await categoryService.deleteCategory(req.params.id as string);
  res.json({ message: 'Category deleted' });
};
