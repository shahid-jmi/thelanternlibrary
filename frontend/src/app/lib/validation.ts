const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

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
