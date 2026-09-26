import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import UnauthorizedError from '../../common/errors/UnauthorizedError.js';
import AppError from '../../common/errors/AppError.js';
import logger from '../../common/utils/logger.js';
import { sendPasswordResetEmail } from '../../common/services/mail.service.js';
import * as adminRepository from './admin.repository.js';
import type { AdminRole } from '../admins/admin.constants.js';

const SALT_ROUNDS = 10;
const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export interface AdminTokenPayload {
  sub: string;
  role: AdminRole;
  tv: number;
}

export interface LoginResult {
  token: string;
  mustChangePassword: boolean;
  admin: {
    id: string;
    email: string;
    role: AdminRole;
  };
}

const signToken = (payload: AdminTokenPayload): string =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: '24h' });

// SHA-256 hash of the raw reset token, so only the hash ever touches the
// database — the raw token exists only in the email link and the request
// that redeems it. Lookups happen via an exact hash match in MongoDB, which
// carries no meaningful timing signal for a 256-bit random token (unlike a
// naive in-process string comparison); bcrypt.compare below remains the
// constant-time guarantee where it actually matters, for passwords.
const hashResetToken = (rawToken: string): string =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

export const loginAdmin = async (email: string, password: string): Promise<LoginResult> => {
  const admin = await adminRepository.findByEmail(email);

  if (!admin || !admin.isActive) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);

  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = signToken({
    sub: admin._id.toString(),
    role: admin.role,
    tv: admin.tokenVersion,
  });

  return {
    token,
    mustChangePassword: admin.mustChangePassword,
    admin: {
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    },
  };
};

export const changePassword = async (
  adminId: string,
  currentPassword: string,
  newPassword: string
): Promise<string> => {
  const admin = await adminRepository.findById(adminId);

  if (!admin) {
    throw new UnauthorizedError('Token is not valid');
  }

  const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);

  if (!isMatch) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw new AppError('New password must be different from the current password', 400);
  }

  admin.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  admin.passwordChangedAt = new Date();
  admin.mustChangePassword = false;
  admin.passwordResetTokenHash = null;
  admin.passwordResetExpiresAt = null;
  // Log out every other session (e.g. a stolen token), then hand the caller
  // a fresh token so the session they changed it from keeps working.
  admin.tokenVersion += 1;
  await admin.save();

  return signToken({
    sub: admin._id.toString(),
    role: admin.role,
    tv: admin.tokenVersion,
  });
};

const issuePasswordReset = async (email: string): Promise<void> => {
  const admin = await adminRepository.findByEmail(email);

  if (!admin || !admin.isActive) {
    return;
  }

  const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
  admin.passwordResetTokenHash = hashResetToken(rawToken);
  admin.passwordResetExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await admin.save();

  const resetUrl = `${env.frontendUrl}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(admin.email, resetUrl);
  } catch (error) {
    // A delivery failure must not surface differently than success —
    // otherwise timing/response differences would leak account existence.
    logger.error(
      { err: error, adminId: admin._id.toString() },
      'Failed to send password reset email'
    );
  }
};

// Deliberately not awaited: for a real account the token write and SMTP send
// take far longer than the early return for an unknown one, so awaiting here
// would let response timing reveal which emails belong to admins. Running it
// off the request path makes every response equally fast.
export const requestPasswordReset = (email: string): void => {
  issuePasswordReset(email).catch((error: unknown) => {
    logger.error({ err: error }, 'Failed to issue password reset');
  });
};

export const resetPassword = async (rawToken: string, newPassword: string): Promise<void> => {
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const admin = await adminRepository.redeemResetToken(hashResetToken(rawToken), passwordHash);

  if (!admin) {
    throw new UnauthorizedError('This reset link is invalid or has expired');
  }
};
