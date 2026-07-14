import './instrument.js';
import type { Server } from 'node:http';
import createApp from './app.js';
import env from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import logger from './common/utils/logger.js';

let server: Server | undefined;

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((error) => {
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
    logger.error({ err: error }, 'Graceful shutdown failed');
    process.exit(1);
  }
};

const startServer = async (): Promise<void> => {
  await connectDatabase();
  logger.info('Connected to MongoDB');

  const app = createApp();

  server = app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} (docs at /api/v1/docs)`);
  });
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

startServer().catch((error: unknown) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
