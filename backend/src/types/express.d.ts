import type { AdminRole } from '../modules/admins/admin.constants.js';

declare global {
  namespace Express {
    interface Request {
      admin?: { id: string; role: AdminRole };
    }
  }
}

export {};
