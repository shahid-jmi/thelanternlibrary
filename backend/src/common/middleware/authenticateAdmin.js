import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('No token, authorization denied'));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (!decoded.admin) {
      next(new UnauthorizedError('Token is not an admin token'));
      return;
    }

    req.admin = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Token is not valid'));
  }
};

export default authenticateAdmin;
