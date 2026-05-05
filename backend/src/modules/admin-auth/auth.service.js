import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import UnauthorizedError from '../../common/errors/UnauthorizedError.js';

export const loginAdmin = async (password) => {
  const isMatch = await bcrypt.compare(password, env.adminPasswordHash);

  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  return jwt.sign({ admin: true }, env.jwtSecret, { expiresIn: '24h' });
};
