import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import createApp from '../app.js';
import { startTestDatabase, stopTestDatabase } from './db.js';

// Must be set before env.ts is first imported (imports are hoisted).
vi.hoisted(() => {
  process.env.TRUST_PROXY = '3';
});

const app = createApp();

// Mirrors what Render delivers: client, Cloudflare, Render internal proxy.
const forwardedFrom = (clientIp: string) => `${clientIp}, 172.68.0.1, 10.0.0.1`;

const failedLogin = (clientIp: string) =>
  request(app)
    .post('/api/v1/admin/auth/login')
    .set('X-Forwarded-For', forwardedFrom(clientIp))
    .send({ email: 'nobody@test.com', password: 'wrong-password' });

beforeAll(async () => {
  await startTestDatabase();
});

afterAll(async () => {
  await stopTestDatabase();
});

describe('trust proxy', () => {
  it('rate limits each client separately instead of lumping everyone together', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect((await failedLogin('203.0.113.1')).status).toBe(401);
    }

    expect((await failedLogin('203.0.113.1')).status).toBe(429);

    // A different visitor behind the same proxies is unaffected.
    expect((await failedLogin('203.0.113.2')).status).toBe(401);
  });

  it('ignores an X-Forwarded-For entry the client forged', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await failedLogin('203.0.113.3');
    }

    // Prepending a fake IP doesn't escape the limit: the real client IP is
    // still the one Cloudflare recorded, three hops from the app.
    const spoofed = await request(app)
      .post('/api/v1/admin/auth/login')
      .set('X-Forwarded-For', `198.51.100.99, ${forwardedFrom('203.0.113.3')}`)
      .send({ email: 'nobody@test.com', password: 'wrong-password' });

    expect(spoofed.status).toBe(429);
  });
});
