import type { NextFunction, Request, Response } from 'express';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import Customer, { type CustomerLean } from '../../modules/customers/customer.model.js';
import { verifyCustomerToken } from '../../modules/customers/customer.tokens.js';

const bearerToken = (req: Request): string | null => {
  const header = req.header('Authorization');
  return header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
};

const resolveCustomer = async (token: string): Promise<CustomerLean | null> => {
  try {
    const payload = verifyCustomerToken(token);
    const customer = await Customer.findById(payload.sub).lean<CustomerLean>().exec();
    if (!customer || !customer.isActive || customer.tokenVersion !== payload.tv) return null;
    return customer;
  } catch {
    return null;
  }
};

// Requires a signed-in customer.
export const authenticateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = bearerToken(req);
  if (!token) {
    next(new UnauthorizedError('Please sign in'));
    return;
  }
  const customer = await resolveCustomer(token);
  if (!customer) {
    next(new UnauthorizedError('Your session has expired. Please sign in again.'));
    return;
  }
  req.customer = { id: customer._id.toString(), email: customer.email };
  next();
};

// Attaches the customer when a valid token is sent, but lets guests through
// (e.g. placing an order without an account).
export const optionalCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = bearerToken(req);
  if (token) {
    const customer = await resolveCustomer(token);
    if (customer) req.customer = { id: customer._id.toString(), email: customer.email };
  }
  next();
};
