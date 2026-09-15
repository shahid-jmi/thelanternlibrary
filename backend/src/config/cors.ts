import type { CorsOptions } from 'cors';
import env from './env.js';

// Matches any Vercel deployment (production, hash previews, and
// git-branch previews) without hardcoding individual project URLs.
const VERCEL_PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

// Local dev servers run on varying ports (Vite, CRA, etc.); allow any
// localhost port, but only outside production.
const LOCALHOST_ORIGIN = /^http:\/\/localhost:\d+$/;

const isAllowedOrigin = (origin: string): boolean => {
  if (env.corsOrigins.includes(origin)) {
    return true;
  }

  if (VERCEL_PREVIEW_ORIGIN.test(origin)) {
    return true;
  }

  if (env.nodeEnv !== 'production' && LOCALHOST_ORIGIN.test(origin)) {
    return true;
  }

  return false;
};

const createCorsOptions = (): CorsOptions => ({
  origin(origin, callback) {
    // Non-browser clients (curl, server-to-server) send no Origin header.
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  },
  // The frontend authenticates with a Bearer token (see authenticateAdmin.ts),
  // not cookies, so credentialed CORS isn't required. Flip this to true if
  // cookie-based auth is introduced later.
  credentials: false,
});

export default createCorsOptions;
