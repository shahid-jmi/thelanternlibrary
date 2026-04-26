import * as bookService from './book.service.js';

export const listPublicBooks = async (req, res) => {
  const books = await bookService.listPublicBooks(req.query);
  res.json(books);
};

export const getPublicBookById = async (req, res) => {
  const lang = req.query.lang || 'en';
  const book = await bookService.getPublicBookById(req.params.id, lang);
  res.json(book);
};

export const listAdminBooks = async (req, res) => {
  const books = await bookService.listAdminBooks();
  res.json(books);
};

export const createBook = async (req, res) => {
  const book = await bookService.createBook(req.body);
  res.status(201).json(book);
};

export const updateBook = async (req, res) => {
  const book = await bookService.updateBook(req.params.id, req.body);
  res.json(book);
};

export const deleteBook = async (req, res) => {
  await bookService.deleteBook(req.params.id);
  res.json({ message: 'Book deleted' });
};

export const updateAvailability = async (req, res) => {
  const book = await bookService.updateAvailability(req.params.id, req.body.isAvailable);
  res.json(book);
};
