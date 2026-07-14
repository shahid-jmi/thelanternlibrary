import AppError, { type ErrorDetail } from './AppError.js';

export default class ValidationError extends AppError {
  constructor(message = 'Validation failed', details: ErrorDetail[] = []) {
    super(message, 400, details);
  }
}
