import { z } from 'zod';

export const MIN_PASSWORD_LENGTH = 8;

export const passwordSchema = z
  .string({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` })
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
