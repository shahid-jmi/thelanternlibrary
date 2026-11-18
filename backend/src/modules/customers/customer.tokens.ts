import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import env from '../../config/env.js';

export interface CustomerTokenPayload {
  sub: string;
  tv: number;
}

// Customer logins are signed with a key derived from JWT_SECRET but distinct
// from the admin key, so a customer token can never pass as an admin token
// (or the other way round), with no extra environment variable to manage.
const customerSecret = crypto
  .createHmac('sha256', env.jwtSecret)
  .update('customer-session')
  .digest('hex');

const AUDIENCE = 'customer';

// Customers expect to stay signed in on their own phone.
export const signCustomerToken = (payload: CustomerTokenPayload): string =>
  jwt.sign(payload, customerSecret, { expiresIn: '30d', audience: AUDIENCE });

export const verifyCustomerToken = (token: string): CustomerTokenPayload =>
  jwt.verify(token, customerSecret, { audience: AUDIENCE }) as CustomerTokenPayload;

// One-time tokens (email verification, password reset) are random; only
// their SHA-256 hash is stored, so a database leak doesn't expose live links.
export const createOneTimeToken = (): { raw: string; hash: string } => {
  const raw = crypto.randomBytes(32).toString('hex');
  return { raw, hash: hashOneTimeToken(raw) };
};

export const hashOneTimeToken = (raw: string): string =>
  crypto.createHash('sha256').update(raw).digest('hex');
