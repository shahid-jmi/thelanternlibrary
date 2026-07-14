import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import * as adminRepository from '../../modules/admin-auth/admin.repository.js';

const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('No token, authorization denied'));
    return;
  }

  const token = authHeader.split(' ')[1];

  let decoded;

  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    next(new UnauthorizedError('Token is not valid'));
    return;
  }

  let admin;

  try {
    admin = await adminRepository.findByIdLean(decoded.sub);
  } catch (error) {
    next(new UnauthorizedError('Token is not valid'));
    return;
  }

  if (!admin || !admin.isActive || admin.tokenVersion !== decoded.tv) {
    next(new UnauthorizedError('Token is not valid'));
    return;
  }

  req.admin = { id: admin._id, role: admin.role };
  next();
};

export default authenticateAdmin;
