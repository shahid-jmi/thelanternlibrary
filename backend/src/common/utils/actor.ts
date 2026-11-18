import type { Request } from 'express';
import UnauthorizedError from '../errors/UnauthorizedError.js';

export interface Actor {
  id: string;
  email: string;
}

// The admin making the request, for "who did this" records (stock history,
// order timeline). Only valid behind authenticateAdmin.
export const actorOf = (req: Request): Actor => {
  if (!req.admin) throw new UnauthorizedError('No token, authorization denied');
  return { id: req.admin.id, email: req.admin.email };
};
