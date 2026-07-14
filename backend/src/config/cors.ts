import type { CorsOptions } from 'cors';
import env from './env.js';

const createCorsOptions = (): CorsOptions => ({
  origin(origin, callback) {
    // Non-browser clients (curl, server-to-server) send no Origin header.
    if (!origin || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  },
});

export default createCorsOptions;
