// Provide a complete environment before src/config/env.ts is imported anywhere.
// Tests that need a database start their own mongodb-memory-server and connect
// mongoose to it directly.
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lantern-test';
process.env.JWT_SECRET = 'test-jwt-secret-test-jwt-secret-test-jwt-secret';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.R2_ACCOUNT_ID = 'test-account';
process.env.R2_ACCESS_KEY_ID = 'test-access-key';
process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.R2_BUCKET_NAME = 'test-bucket';
process.env.R2_PUBLIC_URL = 'https://covers.test.example.com';
