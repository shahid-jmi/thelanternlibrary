import env from './env.js';

const createCorsOptions = () => {
  if (env.corsOrigins.length === 0) {
    return {};
  }

  return {
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    },
  };
};

export default createCorsOptions;
