import express from 'express';
import cors from 'cors';
import createCorsOptions from './config/cors.js';
import authenticateAdmin from './common/middleware/authenticateAdmin.js';
import errorHandler from './common/middleware/errorHandler.js';
import notFound from './common/middleware/notFound.js';
import authRouter from './modules/admin-auth/auth.routes.js';
import { createAdminBookRouter, createPublicBookRouter } from './modules/books/book.routes.js';

const app = express();
const publicBooksRouter = createPublicBookRouter();
const adminBooksRouter = createAdminBookRouter();

app.use(cors(createCorsOptions()));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/books', publicBooksRouter);
app.use('/api/admin/auth', authRouter);
app.use('/api/admin/books', authenticateAdmin, adminBooksRouter);

app.use('/api/v1/books', publicBooksRouter);
app.use('/api/v1/admin/auth', authRouter);
app.use('/api/v1/admin/books', authenticateAdmin, adminBooksRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
