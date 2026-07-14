import 'dotenv/config';
import { z } from 'zod';

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().min(1, 'MONGO_URI must be set'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  CORS_ORIGIN: z.string().optional(),
  LOG_LEVEL: z.enum(LOG_LEVELS).optional(),
  SENTRY_DSN: z.string().optional(),
  R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID must be set'),
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID must be set'),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY must be set'),
  R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME must be set'),
  R2_PUBLIC_URL: z.string().min(1, 'R2_PUBLIC_URL must be set'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${problems}`);
}

const raw = parsed.data;

const parseOrigins = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const corsOrigins = parseOrigins(raw.CORS_ORIGIN);

// Fail closed: a production deploy must state its allowed origins explicitly.
if (raw.NODE_ENV === 'production' && corsOrigins.length === 0) {
  throw new Error(
    'CORS_ORIGIN must be set in production (comma-separated list of allowed origins)'
  );
}

if (corsOrigins.length === 0) {
  corsOrigins.push('http://localhost:5173');
}

const env = {
  nodeEnv: raw.NODE_ENV,
  port: raw.PORT,
  mongoUri: raw.MONGO_URI,
  jwtSecret: raw.JWT_SECRET,
  corsOrigins,
  logLevel: raw.LOG_LEVEL ?? (raw.NODE_ENV === 'test' ? 'silent' : 'info'),
  sentryDsn: raw.SENTRY_DSN,
  r2AccountId: raw.R2_ACCOUNT_ID,
  r2AccessKeyId: raw.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: raw.R2_SECRET_ACCESS_KEY,
  r2BucketName: raw.R2_BUCKET_NAME,
  r2PublicUrl: raw.R2_PUBLIC_URL,
} as const;

export type Env = typeof env;

export default env;
