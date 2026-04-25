import express from 'express';
import Book from '../../models/Book.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { lang = 'en', genre, language, available, search } = req.query;
    
    let query = {};
    if (genre) query.genre = genre;
    if (language) query.language = language;
    if (available !== undefined) query.isAvailable = available === 'true';
    if (search) {
      query.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.ur': { $regex: search, $options: 'i' } }
      ];
    }

    const books = await Book.find(query);

    const flattenedBooks = books.map(book => {
      const bookObj = book.toObject();
      return {
        _id: bookObj._id,
        title: bookObj.title[lang] || bookObj.title.en,
        description: bookObj.description[lang] || bookObj.description.en,
        author: bookObj.author,
        price: bookObj.price,
        genre: bookObj.genre,
        coverImage: bookObj.coverImage,
        isAvailable: bookObj.isAvailable,
        language: bookObj.language,
        createdAt: bookObj.createdAt
      };
    });

    res.json(flattenedBooks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const bookObj = book.toObject();
    const flattenedBook = {
      _id: bookObj._id,
      title: bookObj.title[lang] || bookObj.title.en,
      description: bookObj.description[lang] || bookObj.description.en,
      author: bookObj.author,
      price: bookObj.price,
      genre: bookObj.genre,
      coverImage: bookObj.coverImage,
      isAvailable: bookObj.isAvailable,
      language: bookObj.language,
      createdAt: bookObj.createdAt
    };

    res.json(flattenedBook);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
