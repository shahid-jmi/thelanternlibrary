import AppError from './AppError.js';

export default class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = []) {
    super(message, 400, details);
  }
}
