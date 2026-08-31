import { z } from 'zod';
import { passwordSchema } from '../../common/validation/password.js';

export const loginBodySchema = z.object({
  email: z
    .string({ message: 'A valid email is required' })
    .trim()
    .email('A valid email is required'),
  password: z.string({ message: 'Password is required' }).min(1, 'Password is required'),
});

export const changePasswordBodySchema = z
  .object({
    currentPassword: z
      .string({ message: 'Current password is required' })
      .min(1, 'Current password is required'),
    newPassword: passwordSchema,
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  });

export const forgotPasswordBodySchema = z.object({
  email: z
    .string({ message: 'A valid email is required' })
    .trim()
    .email('A valid email is required'),
});

export const resetPasswordBodySchema = z.object({
  token: z.string({ message: 'Reset token is required' }).min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

export type LoginInput = z.infer<typeof loginBodySchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordBodySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordBodySchema>;
