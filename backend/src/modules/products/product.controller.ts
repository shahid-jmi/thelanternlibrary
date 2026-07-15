import type { Request, Response } from 'express';
import * as productService from './product.service.js';
import type {
  GetPublicProductQuery,
  ListPublicProductsQuery,
  UpdateAvailabilityInput,
  UpsertProductInput,
} from './product.validators.js';

export const listPublicProducts = async (req: Request, res: Response): Promise<void> => {
  const filters = req.query as unknown as ListPublicProductsQuery;
  const products = await productService.listPublicProducts(filters);
  res.json(products);
};

export const getPublicProductById = async (req: Request, res: Response): Promise<void> => {
  const { lang } = req.query as unknown as GetPublicProductQuery;
  const product = await productService.getPublicProductById(req.params.id as string, lang);
  res.json(product);
};

export const listAdminProducts = async (req: Request, res: Response): Promise<void> => {
  const products = await productService.listAdminProducts();
  res.json(products);
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await productService.createProduct(req.body as UpsertProductInput, req.file);
  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await productService.updateProduct(
    req.params.id as string,
    req.body as UpsertProductInput,
    req.file
  );
  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  await productService.deleteProduct(req.params.id as string);
  res.json({ message: 'Product deleted' });
};

export const updateAvailability = async (req: Request, res: Response): Promise<void> => {
  const { isAvailable } = req.body as UpdateAvailabilityInput;
  const product = await productService.updateAvailability(req.params.id as string, isAvailable);
  res.json(product);
};
