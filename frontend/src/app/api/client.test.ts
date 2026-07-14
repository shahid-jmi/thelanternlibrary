import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { getErrorMessage } from './client';

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

  it('uses the error message for network failures', () => {
    expect(getErrorMessage(new Error('Network Error'))).toBe('Network Error');
  });

  it('falls back to a generic message', () => {
    const error = makeAxiosError(500, {});
    expect(getErrorMessage(error)).toBe('Something went wrong. Please try again.');
  });
});
