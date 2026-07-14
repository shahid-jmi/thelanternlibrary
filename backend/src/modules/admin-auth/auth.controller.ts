import type { Request, Response } from 'express';
import * as authService from './auth.service.js';
import type { LoginInput } from './auth.validators.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput;
  const token = await authService.loginAdmin(email, password);
  res.json({ token });
};
