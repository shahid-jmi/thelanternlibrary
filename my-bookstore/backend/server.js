import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import publicBooksRouter from './routes/public/books.js';
import adminAuthRouter from './routes/admin/auth.js';
import adminBooksRouter from './routes/admin/books.js';
import adminAuthMiddleware from './middleware/adminAuth.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/books', publicBooksRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/books', adminAuthMiddleware, adminBooksRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI must be set in .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);  // ← also add this so server doesn't hang on failed connection
  });

mongoose.connection.on('disconnected', () => {
  console.error('MongoDB disconnected');
});