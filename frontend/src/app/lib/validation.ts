const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PINCODE_PATTERN = /^\d{6}$/;

export type FieldErrorKey =
  | 'validation.emailRequired'
  | 'validation.emailInvalid'
  | 'validation.passwordRequired'
  | 'validation.passwordTooShort';

export function validateEmail(value: string): FieldErrorKey | undefined {
  if (!value.trim()) return 'validation.emailRequired';
  if (!EMAIL_PATTERN.test(value.trim())) return 'validation.emailInvalid';
  return undefined;
}

export function validatePassword(value: string): FieldErrorKey | undefined {
  if (!value) return 'validation.passwordRequired';
  if (value.length < MIN_PASSWORD_LENGTH) return 'validation.passwordTooShort';
  return undefined;
}

export type RequiredErrorKey = 'validation.required';

export function validateRequired(value: string): RequiredErrorKey | undefined {
  return value.trim() ? undefined : 'validation.required';
}

export type PriceErrorKey = 'validation.required' | 'validation.priceInvalid';

export function validatePrice(value: string): PriceErrorKey | undefined {
  if (!value.trim()) return 'validation.required';
  const amount = Number(value);
  if (Number.isNaN(amount) || amount < 0) return 'validation.priceInvalid';
  return undefined;
}

export type SlugErrorKey = 'validation.required' | 'validation.slugInvalid';

export function validateSlug(value: string): SlugErrorKey | undefined {
  if (!value.trim()) return 'validation.required';
  if (!SLUG_PATTERN.test(value.trim())) return 'validation.slugInvalid';
  return undefined;
}

export type PincodeErrorKey = 'validation.required' | 'validation.pincodeInvalid';

export function validatePincode(value: string): PincodeErrorKey | undefined {
  if (!value.trim()) return 'validation.required';
  if (!PINCODE_PATTERN.test(value.trim())) return 'validation.pincodeInvalid';
  return undefined;
}
