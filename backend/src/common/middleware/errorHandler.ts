import type { ErrorRequestHandler } from 'express';
import AppError from '../errors/AppError.js';
import logger from '../utils/logger.js';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, err.message);
    }

    res.status(err.statusCode).json({
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  if (err instanceof Error && err.name === 'CastError') {
    res.status(400).json({ message: 'Invalid resource identifier' });
    return;
  }

  logger.error({ err }, err instanceof Error ? err.message : 'Unhandled error');
  res.status(500).json({ message: 'Internal Server Error' });
};

export default errorHandler;
