import app from './app.js';
import env from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import logger from './common/utils/logger.js';

let server;

const shutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('Graceful shutdown failed', error);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDatabase();
  logger.info('Connected to MongoDB');

  server = app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
