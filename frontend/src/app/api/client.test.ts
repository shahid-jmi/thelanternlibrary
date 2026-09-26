import { afterEach, describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { getErrorMessage, isSessionExpired } from '@/app/api/client';
import { clearToken, setToken } from '@/app/auth/authStorage';

function makeAxiosError(status: number, data: unknown, url = '/admin/books'): AxiosError {
  const error = new AxiosError('Request failed', String(status));
  error.config = { url, headers: new AxiosHeaders() };
  error.response = {
    status,
    statusText: '',
    headers: {},
    config: error.config,
    data,
  };
  return error;
}

describe('isSessionExpired', () => {
  afterEach(() => clearToken());

  it('treats a 401 on a normal endpoint while logged in as an expired session', () => {
    setToken('some-token');
    expect(isSessionExpired(makeAxiosError(401, {}))).toBe(true);
  });

  it('ignores a 401 when not logged in', () => {
    expect(isSessionExpired(makeAxiosError(401, {}))).toBe(false);
  });

  it('ignores non-401 errors', () => {
    setToken('some-token');
    expect(isSessionExpired(makeAxiosError(403, {}))).toBe(false);
  });

  it.each(['/admin/auth/reset-password', '/admin/auth/change-password', '/admin/auth/login'])(
    'leaves a 401 from %s for the page to show, even while logged in',
    (url) => {
      setToken('some-token');
      expect(isSessionExpired(makeAxiosError(401, {}, url))).toBe(false);
    }
  );
});

describe('getErrorMessage', () => {
  it('joins validation detail messages', () => {
    const error = makeAxiosError(400, {
      message: 'Validation failed',
      details: [{ msg: 'Author is required' }, { msg: 'Genre is invalid' }],
    });
    expect(getErrorMessage(error)).toBe('Author is required Genre is invalid');
  });

  it('uses the server message when there are no details', () => {
    const error = makeAxiosError(401, { message: 'Invalid credentials' });
    expect(getErrorMessage(error)).toBe('Invalid credentials');
  });

  it('uses the error message for a non-axios error', () => {
    expect(getErrorMessage(new Error('Network Error'))).toBe('Network Error');
  });

  it('gives a friendly message when no response reaches the client (offline/unreachable server)', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK');
    error.request = {};
    expect(getErrorMessage(error)).toBe(
      'Unable to reach the server. Please check your internet connection.'
    );
  });

  it('gives a friendly message for a request timeout', () => {
    const error = new AxiosError('timeout of 10000ms exceeded', 'ECONNABORTED');
    error.request = {};
    expect(getErrorMessage(error)).toBe('The request took too long. Please try again.');
  });

  it('falls back to a generic message', () => {
    const error = makeAxiosError(500, {});
    expect(getErrorMessage(error)).toBe('Something went wrong. Please try again.');
  });
});
