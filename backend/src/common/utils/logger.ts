import { pino } from 'pino';
import env from '../../config/env.js';

const logger = pino({
  level: env.logLevel,
  ...(env.nodeEnv === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:HH:MM:ss' },
        },
      }
    : {}),
});

export default logger;
