import AppError from '../errors/AppError.js';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  logger.error(err.message, err.stack);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ message: 'Invalid resource identifier' });
    return;
  }

  res.status(500).json({ message: 'Internal Server Error' });
};

export default errorHandler;
