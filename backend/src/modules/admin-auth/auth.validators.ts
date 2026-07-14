import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z
    .string({ message: 'A valid email is required' })
    .trim()
    .email('A valid email is required'),
  password: z.string({ message: 'Password is required' }).min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginBodySchema>;
