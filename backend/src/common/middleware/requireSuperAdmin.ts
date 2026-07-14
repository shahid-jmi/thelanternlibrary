import type { NextFunction, Request, Response } from 'express';
import ForbiddenError from '../errors/ForbiddenError.js';

const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.admin?.role !== 'super_admin') {
    next(new ForbiddenError('Super admin access required'));
    return;
  }

  next();
};

export default requireSuperAdmin;
