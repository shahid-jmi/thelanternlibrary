import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import * as adminRepository from '../../modules/admin-auth/admin.repository.js';
import type { AdminTokenPayload } from '../../modules/admin-auth/auth.service.js';

const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('No token, authorization denied'));
    return;
  }

  const token = authHeader.slice('Bearer '.length);

  let decoded: AdminTokenPayload;

  try {
    decoded = jwt.verify(token, env.jwtSecret) as AdminTokenPayload;
  } catch {
    next(new UnauthorizedError('Token is not valid'));
    return;
  }

  let admin;

  try {
    admin = await adminRepository.findByIdLean(decoded.sub);
  } catch {
    next(new UnauthorizedError('Token is not valid'));
    return;
  }

  if (!admin || !admin.isActive || admin.tokenVersion !== decoded.tv) {
    next(new UnauthorizedError('Token is not valid'));
    return;
  }

  req.admin = { id: admin._id.toString(), role: admin.role };
  next();
};

export default authenticateAdmin;
