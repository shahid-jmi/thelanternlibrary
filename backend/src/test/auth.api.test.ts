import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import createApp from '../app.js';
import Admin from '../modules/admin-auth/admin.model.js';
import { startTestDatabase, stopTestDatabase } from './db.js';

const app = createApp();

const SUPER_ADMIN = { email: 'super@test.com', password: 'super-secret-1' };
const REGULAR_ADMIN = { email: 'admin@test.com', password: 'admin-secret-1' };

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/admin/auth/login').send({ email, password });

beforeAll(async () => {
  await startTestDatabase();

  await Admin.create(
    {
      email: SUPER_ADMIN.email,
      passwordHash: await bcrypt.hash(SUPER_ADMIN.password, 4),
      role: 'super_admin',
      isActive: true,
    },
    {
      email: REGULAR_ADMIN.email,
      passwordHash: await bcrypt.hash(REGULAR_ADMIN.password, 4),
      role: 'admin',
      isActive: true,
    }
  );
});

afterAll(async () => {
  await stopTestDatabase();
});

describe('POST /api/v1/admin/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const response = await login(SUPER_ADMIN.email, SUPER_ADMIN.password);

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe('string');
  });

  it('rejects a wrong password without leaking which field failed', async () => {
    const response = await login(SUPER_ADMIN.email, 'wrong-password');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });
});

describe('admin route protection', () => {
  it('rejects requests without a token', async () => {
    const response = await request(app).get('/api/v1/admin/books');

    expect(response.status).toBe(401);
  });

  it('rejects a garbage token', async () => {
    const response = await request(app)
      .get('/api/v1/admin/books')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(response.status).toBe(401);
  });

  it('lets an authenticated admin list books', async () => {
    const { body } = await login(REGULAR_ADMIN.email, REGULAR_ADMIN.password);

    const response = await request(app)
      .get('/api/v1/admin/books')
      .set('Authorization', `Bearer ${body.token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('blocks a regular admin from admin management', async () => {
    const { body } = await login(REGULAR_ADMIN.email, REGULAR_ADMIN.password);

    const response = await request(app)
      .get('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${body.token}`);

    expect(response.status).toBe(403);
  });

  it('lets a super admin manage admin accounts', async () => {
    const { body } = await login(SUPER_ADMIN.email, SUPER_ADMIN.password);

    const listResponse = await request(app)
      .get('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${body.token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(2);

    const createResponse = await request(app)
      .post('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${body.token}`)
      .send({ email: 'new-admin@test.com', password: 'password123', role: 'admin' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.email).toBe('new-admin@test.com');

    const duplicateResponse = await request(app)
      .post('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${body.token}`)
      .send({ email: 'new-admin@test.com', password: 'password123', role: 'admin' });

    expect(duplicateResponse.status).toBe(409);
  });
});
