import express from 'express';
import { body, validationResult } from 'express-validator';
import Book from '../../models/Book.js';

const router = express.Router();

const validateBook = [
  body('title.en').notEmpty().withMessage('English title is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('genre').notEmpty().withMessage('Genre is required'),
  body('language').notEmpty().withMessage('Language is required'),
];

router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/', validateBook, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.put('/:id', validateBook, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.patch('/:id/availability', async (req, res) => {
  try {
    const { isAvailable } = req.body;
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'isAvailable must be a boolean' });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
