import type { Request, Response } from 'express';
import * as bookService from './book.service.js';
import type {
  GetPublicBookQuery,
  ListPublicBooksQuery,
  UpdateAvailabilityInput,
  UpsertBookInput,
} from './book.validators.js';

export const listPublicBooks = async (req: Request, res: Response): Promise<void> => {
  const filters = req.query as unknown as ListPublicBooksQuery;
  const books = await bookService.listPublicBooks(filters);
  res.json(books);
};

export const getPublicBookById = async (req: Request, res: Response): Promise<void> => {
  const { lang } = req.query as unknown as GetPublicBookQuery;
  const book = await bookService.getPublicBookById(req.params.id as string, lang);
  res.json(book);
};

export const listAdminBooks = async (req: Request, res: Response): Promise<void> => {
  const books = await bookService.listAdminBooks();
  res.json(books);
};

export const createBook = async (req: Request, res: Response): Promise<void> => {
  const book = await bookService.createBook(req.body as UpsertBookInput, req.file);
  res.status(201).json(book);
};

export const updateBook = async (req: Request, res: Response): Promise<void> => {
  const book = await bookService.updateBook(
    req.params.id as string,
    req.body as UpsertBookInput,
    req.file
  );
  res.json(book);
};

export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  await bookService.deleteBook(req.params.id as string);
  res.json({ message: 'Book deleted' });
};

export const updateAvailability = async (req: Request, res: Response): Promise<void> => {
  const { isAvailable } = req.body as UpdateAvailabilityInput;
  const book = await bookService.updateAvailability(req.params.id as string, isAvailable);
  res.json(book);
};
