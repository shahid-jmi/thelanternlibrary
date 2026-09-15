import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import createApp from '../app.js';
import { startTestDatabase, stopTestDatabase } from './db.js';

const app = createApp();

beforeAll(async () => {
  await startTestDatabase();
});

afterAll(async () => {
  await stopTestDatabase();
});

describe('malformed request bodies', () => {
  it('returns 400 (not 500) for invalid JSON', async () => {
    const response = await request(app)
      .post('/api/v1/admin/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "broken"');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid JSON in request body');
  });

  it('returns 413 (not 500) for an oversized body', async () => {
    const response = await request(app)
      .post('/api/v1/admin/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'a@test.com', password: 'x'.repeat(2 * 1024 * 1024) });

    expect(response.status).toBe(413);
    expect(response.body.message).toBe('Request body is too large');
  });

  it('returns 404 (not 500) for an unknown route', async () => {
    const response = await request(app).get('/api/v1/no-such-route');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Route not found');
  });
});
