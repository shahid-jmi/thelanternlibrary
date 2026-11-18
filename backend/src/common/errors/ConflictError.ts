import AppError, { type ErrorDetail } from './AppError.js';

// The request is valid but clashes with the current state — e.g. asking for
// more copies than are in stock.
export default class ConflictError extends AppError {
  constructor(message = 'Conflict', details: ErrorDetail[] | null = null) {
    super(message, 409, details);
  }
}
