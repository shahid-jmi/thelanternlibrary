import { z } from 'zod';

// Multipart form fields and query params arrive as the strings 'true'/'false';
// JSON bodies send real booleans. z.coerce.boolean() would treat 'false' as true.
export const booleanFromString = (message: string) =>
  z.union([z.boolean(), z.enum(['true', 'false']).transform((value) => value === 'true')], {
    message,
  });
