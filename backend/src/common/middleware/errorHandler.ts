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

  // express.json() throws these as plain (non-AppError) errors when the
  // request body is malformed or exceeds the size limit. Without this they
  // fall through to the generic 500 below and get logged as a server
  // error, even though they're really the client's mistake.
  const bodyParserErrorType = (err as { type?: string } | null)?.type;
  if (bodyParserErrorType === 'entity.parse.failed') {
    res.status(400).json({ message: 'Invalid JSON in request body' });
    return;
  }
  if (bodyParserErrorType === 'entity.too.large') {
    res.status(413).json({ message: 'Request body is too large' });
    return;
  }

  logger.error({ err }, err instanceof Error ? err.message : 'Unhandled error');
  res.status(500).json({ message: 'Internal Server Error' });
};

export default errorHandler;
