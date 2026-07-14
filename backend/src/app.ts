import express, { type Express } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import * as Sentry from '@sentry/node';
import env from './config/env.js';
import createCorsOptions from './config/cors.js';
import httpLogger from './common/middleware/httpLogger.js';
import authenticateAdmin from './common/middleware/authenticateAdmin.js';
import requireSuperAdmin from './common/middleware/requireSuperAdmin.js';
import errorHandler from './common/middleware/errorHandler.js';
import notFound from './common/middleware/notFound.js';
import authRouter from './modules/admin-auth/auth.routes.js';
import { createAdminBookRouter, createPublicBookRouter } from './modules/books/book.routes.js';
import { createAdminManagementRouter } from './modules/admins/admin.routes.js';
import openApiDocument from './docs/openapi.js';

const createApp = (): Express => {
  const app = express();

  app.use(helmet());
  app.use(cors(createCorsOptions()));
  app.use(compression());

  if (env.nodeEnv !== 'test') {
    app.use(httpLogger);
  }

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  const apiV1 = express.Router();

  apiV1.use('/books', createPublicBookRouter());
  apiV1.use('/admin/auth', authRouter);
  apiV1.use('/admin/books', authenticateAdmin, createAdminBookRouter());
  apiV1.use('/admin/admins', authenticateAdmin, requireSuperAdmin, createAdminManagementRouter());

  apiV1.get('/docs.json', (req, res) => {
    res.json(openApiDocument);
  });
  apiV1.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use('/api/v1', apiV1);

  app.use(notFound);

  if (env.sentryDsn) {
    Sentry.setupExpressErrorHandler(app);
  }

  app.use(errorHandler);

  return app;
};

export default createApp;
