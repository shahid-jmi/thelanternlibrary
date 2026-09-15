import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { getErrorMessage } from '@/app/api/client';

function makeAxiosError(status: number, data: unknown): AxiosError {
  const error = new AxiosError('Request failed', String(status));
  error.response = {
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  };
  return error;
}

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
