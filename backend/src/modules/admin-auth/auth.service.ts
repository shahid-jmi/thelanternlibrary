import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import UnauthorizedError from '../../common/errors/UnauthorizedError.js';
import * as adminRepository from './admin.repository.js';
import type { AdminRole } from '../admins/admin.constants.js';

export interface AdminTokenPayload {
  sub: string;
  role: AdminRole;
  tv: number;
}

export const loginAdmin = async (email: string, password: string): Promise<string> => {
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

  const payload: AdminTokenPayload = {
    sub: admin._id.toString(),
    role: admin.role,
    tv: admin.tokenVersion,
  };

  return jwt.sign(payload, env.jwtSecret, { expiresIn: '24h' });
};
