import { z } from 'zod';

export const localizedText = (label: string) =>
  z.object({
    en: z
      .string({ message: `English ${label} is required` })
      .trim()
      .min(1, `English ${label} is required`),
    ur: z
      .string({ message: `Urdu ${label} must be a string` })
      .trim()
      .optional(),
  });
