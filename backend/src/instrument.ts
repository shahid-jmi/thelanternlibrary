import * as Sentry from '@sentry/node';
import env from './config/env.js';

// Must be imported before anything else in server.ts so Sentry can hook
// into modules as they load. No-op unless SENTRY_DSN is configured.
if (env.sentryDsn) {
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.nodeEnv,
    tracesSampleRate: 0.1,
  });
}

export const sentryEnabled = Boolean(env.sentryDsn);
