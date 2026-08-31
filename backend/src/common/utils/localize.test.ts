import { describe, expect, it } from 'vitest';
import { getLocalizedField } from './localize.js';

describe('getLocalizedField', () => {
  it('returns the requested language when present', () => {
    expect(getLocalizedField({ en: 'Hello', ur: 'ہیلو' }, 'ur')).toBe('ہیلو');
  });

  it('falls back to English when the requested language is missing', () => {
    expect(getLocalizedField({ en: 'Hello' }, 'ur')).toBe('Hello');
  });

  it('falls back to English when the requested language is an empty string', () => {
    expect(getLocalizedField({ en: 'Hello', ur: '' }, 'ur')).toBe('Hello');
  });

  it('returns an empty string when neither the requested language nor English is set', () => {
    expect(getLocalizedField({ en: '' }, 'ur')).toBe('');
  });
});
