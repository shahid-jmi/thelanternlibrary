import crypto from 'node:crypto';

// Ambiguous characters (I, O, l, o, 0, 1) are excluded so a temporary
// password can be read aloud or retyped without confusion.
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijkmnpqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%^&*';
const ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS + SYMBOLS;

const TEMP_PASSWORD_LENGTH = 12;

const randomChar = (charset: string): string => charset[crypto.randomInt(charset.length)] as string;

// Fisher-Yates shuffle using crypto.randomInt so the guaranteed-diversity
// characters aren't always in the same positions.
const shuffle = (chars: string[]): string[] => {
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    const temp = chars[i] as string;
    chars[i] = chars[j] as string;
    chars[j] = temp;
  }
  return chars;
};

/**
 * Generates a cryptographically random one-time password (new admin
 * accounts, forced resets). Guarantees at least one uppercase, lowercase,
 * digit, and symbol so it always satisfies the password policy.
 */
export const generateTemporaryPassword = (): string => {
  const required = [randomChar(UPPERCASE), randomChar(LOWERCASE), randomChar(DIGITS), randomChar(SYMBOLS)];
  const remaining = Array.from({ length: TEMP_PASSWORD_LENGTH - required.length }, () =>
    randomChar(ALL_CHARS)
  );
  return shuffle([...required, ...remaining]).join('');
};
