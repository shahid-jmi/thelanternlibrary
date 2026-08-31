import type { Request, Response } from 'express';
import * as authService from './auth.service.js';
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from './auth.validators.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput;
  const result = await authService.loginAdmin(email, password);
  res.json(result);
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body as ChangePasswordInput;
  await authService.changePassword(req.admin!.id, currentPassword, newPassword);
  res.json({ message: 'Password changed successfully' });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as ForgotPasswordInput;
  await authService.requestPasswordReset(email);
  res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body as ResetPasswordInput;
  await authService.resetPassword(token, newPassword);
  res.json({ message: 'Password reset successfully' });
};
