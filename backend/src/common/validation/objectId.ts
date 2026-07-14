import { z } from 'zod';

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export const objectId = (message: string) => z.string().regex(OBJECT_ID_PATTERN, message);
