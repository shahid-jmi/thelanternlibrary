import type { AxiosError } from 'axios';
import axios from 'axios';
import { clearToken, getToken } from '@/app/auth/authStorage';
import { clearCustomerToken, getCustomerToken } from '@/app/auth/customerStorage';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

const ADMIN_URL = /^\/?admin\//;
// Customer account endpoints, plus placing an order (which links the order
// to the signed-in customer).
const CUSTOMER_URL = /^\/?(customer\/|orders\/?$)/;

// Each request carries only the token it is meant for, so an admin token is
// never sent to customer endpoints or the other way round.
api.interceptors.request.use((config) => {
  const url = config.url ?? '';
  const token = ADMIN_URL.test(url)
    ? getToken()
    : CUSTOMER_URL.test(url)
      ? getCustomerToken()
      : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

// The auth endpoints answer a bad password or a used/expired reset link with
// 401 too — that's a message for the page to show, not a dead session.
const AUTH_ENDPOINT = /^\/?admin\/auth\//;

// A 401 while holding a token means the session expired or was revoked.
// A 401 without one (e.g. a failed login) is handled by the caller.
export function isSessionExpired(error: AxiosError): boolean {
  const url = error.config?.url ?? '';
  if (error.response?.status !== 401 || !getToken() || !ADMIN_URL.test(url)) return false;
  return !AUTH_ENDPOINT.test(url);
}

let onCustomerUnauthorized: UnauthorizedHandler | null = null;

export function setCustomerUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onCustomerUnauthorized = handler;
}

// Sign-in, sign-up and one-time-link endpoints answer 401 for a wrong
// password or a used link — a message for the page, not an expired session.
const CUSTOMER_AUTH_ENDPOINT =
  /^\/?customer\/(login|register|verify-email|forgot-password|reset-password|change-password)/;

export function isCustomerSessionExpired(error: AxiosError): boolean {
  const url = error.config?.url ?? '';
  if (error.response?.status !== 401 || !getCustomerToken()) return false;
  return /^\/?customer\//.test(url) && !CUSTOMER_AUTH_ENDPOINT.test(url);
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (isSessionExpired(error)) {
      clearToken();
      onUnauthorized?.();
    }
    if (isCustomerSessionExpired(error)) {
      clearCustomerToken();
      onCustomerUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string; details?: Array<{ msg: string }> }>;
  const response = axiosError.response;
  const details = response?.data?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details.map((detail) => detail.msg).join(' ');
  }

  // No response reached the client at all — either the device is offline,
  // the request timed out, or the server is unreachable. Axios surfaces all
  // of these as a plain Error with no `.response`, so give a message that
  // fits the common case instead of the raw "Network Error"/timeout text.
  if (!response && axiosError.request) {
    if (axiosError.code === 'ECONNABORTED') {
      return 'The request took too long. Please try again.';
    }
    return 'Unable to reach the server. Please check your internet connection.';
  }

  if (error instanceof Error && !response) return error.message;
  return response?.data?.message || 'Something went wrong. Please try again.';
}
