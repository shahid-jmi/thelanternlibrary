import { pinoHttp } from 'pino-http';
import logger from '../utils/logger.js';

const httpLogger = pinoHttp({
  logger,
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  customLogLevel(_req, res, err) {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});

export default httpLogger;
