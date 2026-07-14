export interface ErrorDetail {
  path: string;
  msg: string;
}

export default class AppError extends Error {
  readonly statusCode: number;
  readonly details: ErrorDetail[] | null;

  constructor(message: string, statusCode = 500, details: ErrorDetail[] | null = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
