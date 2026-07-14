import ForbiddenError from '../errors/ForbiddenError.js';

const requireSuperAdmin = (req, res, next) => {
  if (req.admin.role !== 'super_admin') {
    next(new ForbiddenError('Super admin access required'));
    return;
  }

  next();
};

export default requireSuperAdmin;
