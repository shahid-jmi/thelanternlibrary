import type { AxiosError } from 'axios';
import axios from 'axios';
import { clearToken, getToken } from '../auth/authStorage';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // A 401 while holding a token means the session expired or was revoked.
    // A 401 without one (e.g. a failed login) is handled by the caller.
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  const response = (error as AxiosError<{ message?: string; details?: Array<{ msg: string }> }>)
    .response;
  const details = response?.data?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details.map((detail) => detail.msg).join(' ');
  }
  if (error instanceof Error && !response) return error.message;
  return response?.data?.message || 'Something went wrong. Please try again.';
}
