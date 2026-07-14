import { beforeEach, describe, expect, it } from 'vitest';
import { clearToken, decodeAdminToken, getCurrentAdmin, getToken, setToken } from './authStorage';

function makeToken(payload: object): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.fake-signature`;
}

beforeEach(() => {
  localStorage.clear();
});

describe('decodeAdminToken', () => {
  it('extracts sub and role from a JWT payload', () => {
    const token = makeToken({ sub: 'abc123', role: 'super_admin', tv: 0 });
    expect(decodeAdminToken(token)).toEqual({ sub: 'abc123', role: 'super_admin' });
  });

  it('returns null for malformed tokens', () => {
    expect(decodeAdminToken('garbage')).toBeNull();
    expect(decodeAdminToken('a.b.c')).toBeNull();
  });

  it('returns null when required claims are missing', () => {
    const token = makeToken({ role: 'admin' });
    expect(decodeAdminToken(token)).toBeNull();
  });
});

describe('token storage', () => {
  it('stores, reads, and clears the token', () => {
    expect(getToken()).toBeNull();

    setToken('my-token');
    expect(getToken()).toBe('my-token');

    clearToken();
    expect(getToken()).toBeNull();
  });

  it('getCurrentAdmin decodes the stored token', () => {
    setToken(makeToken({ sub: 'id-1', role: 'admin' }));
    expect(getCurrentAdmin()).toEqual({ sub: 'id-1', role: 'admin' });
  });
});
