import ValidationError from '../errors/ValidationError.js';

const parseJsonFormFields = (fields) => (req, res, next) => {
  for (const field of fields) {
    const value = req.body?.[field];

    if (typeof value !== 'string') {
      continue;
    }

    try {
      req.body[field] = JSON.parse(value);
    } catch (error) {
      next(new ValidationError('Validation failed', [{ path: field, msg: `${field} must be valid JSON` }]));
      return;
    }
  }

  next();
};

export default parseJsonFormFields;
