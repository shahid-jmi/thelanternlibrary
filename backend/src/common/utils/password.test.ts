import { describe, expect, it } from 'vitest';
import { generateTemporaryPassword } from './password.js';

const AMBIGUOUS_CHARS = ['I', 'O', 'l', 'o', '0', '1'];

describe('generateTemporaryPassword', () => {
  it('generates a 12-character password', () => {
    expect(generateTemporaryPassword()).toHaveLength(12);
  });

  it('always includes at least one uppercase, lowercase, digit, and symbol', () => {
    // Random generation — run a good number of times to make a real bug
    // (e.g. a shuffle that drops a required character) very unlikely to
    // slip through by chance.
    for (let i = 0; i < 200; i += 1) {
      const password = generateTemporaryPassword();
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[!@#$%^&*]/);
    }
  });

  it('never includes visually ambiguous characters', () => {
    for (let i = 0; i < 200; i += 1) {
      const password = generateTemporaryPassword();
      for (const char of AMBIGUOUS_CHARS) {
        expect(password).not.toContain(char);
      }
    }
  });

  it('produces different passwords across calls', () => {
    const passwords = new Set(Array.from({ length: 20 }, () => generateTemporaryPassword()));
    expect(passwords.size).toBe(20);
  });
});
