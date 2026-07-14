import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import UnauthorizedError from '../../common/errors/UnauthorizedError.js';
import * as adminRepository from './admin.repository.js';

export const loginAdmin = async (email, password) => {
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

  return jwt.sign(
    { sub: admin._id.toString(), role: admin.role, tv: admin.tokenVersion },
    env.jwtSecret,
    { expiresIn: '24h' }
  );
};
