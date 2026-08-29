import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import createApp from '../app.js';
import Admin from '../modules/admin-auth/admin.model.js';
import { sendPasswordResetEmail } from '../common/services/mail.service.js';
import { startTestDatabase, stopTestDatabase } from './db.js';

// The real mail service no-ops when SMTP isn't configured (true in tests),
// which is fine for "always returns 200" checks but not for the full
// forgot -> reset flow, which needs the raw token that's normally only
// ever visible inside the emailed link. Mocking it lets us capture that URL.
vi.mock('../common/services/mail.service.js', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

const sendPasswordResetEmailMock = vi.mocked(sendPasswordResetEmail);

const app = createApp();

const SUPER_ADMIN = { email: 'super@test.com', password: 'super-secret-1' };
const REGULAR_ADMIN = { email: 'admin@test.com', password: 'admin-secret-1' };

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/admin/auth/login').send({ email, password });

const extractTokenFromResetUrl = (resetUrl: string): string =>
  new URL(resetUrl).searchParams.get('token') as string;

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
  it('returns a token and profile for valid credentials', async () => {
    const response = await login(SUPER_ADMIN.email, SUPER_ADMIN.password);

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe('string');
    expect(response.body.mustChangePassword).toBe(false);
    expect(response.body.admin).toMatchObject({
      email: SUPER_ADMIN.email,
      role: 'super_admin',
    });
    expect(typeof response.body.admin.id).toBe('string');
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

describe('newly created admins must change their password', () => {
  it('sets mustChangePassword on the created admin and surfaces it at login', async () => {
    const { body: superLogin } = await login(SUPER_ADMIN.email, SUPER_ADMIN.password);

    const createResponse = await request(app)
      .post('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${superLogin.token}`)
      .send({ email: 'temp-password@test.com', password: 'temp-password-1', role: 'admin' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.mustChangePassword).toBe(true);

    const loginResponse = await login('temp-password@test.com', 'temp-password-1');

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.mustChangePassword).toBe(true);
  });
});

describe('POST /api/v1/admin/auth/change-password', () => {
  const CHANGE_PASSWORD_ADMIN = { email: 'change-password@test.com', password: 'original-pass-1' };

  beforeAll(async () => {
    await Admin.create({
      email: CHANGE_PASSWORD_ADMIN.email,
      passwordHash: await bcrypt.hash(CHANGE_PASSWORD_ADMIN.password, 4),
      role: 'admin',
      isActive: true,
    });
  });

  it('requires authentication', async () => {
    const response = await request(app)
      .post('/api/v1/admin/auth/change-password')
      .send({ currentPassword: 'x', newPassword: 'new-password-1' });

    expect(response.status).toBe(401);
  });

  it('rejects an incorrect current password', async () => {
    const { body } = await login(CHANGE_PASSWORD_ADMIN.email, CHANGE_PASSWORD_ADMIN.password);

    const response = await request(app)
      .post('/api/v1/admin/auth/change-password')
      .set('Authorization', `Bearer ${body.token}`)
      .send({ currentPassword: 'totally-wrong', newPassword: 'new-password-1' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Current password is incorrect');
  });

  it('rejects a new password that fails the policy', async () => {
    const { body } = await login(CHANGE_PASSWORD_ADMIN.email, CHANGE_PASSWORD_ADMIN.password);

    const response = await request(app)
      .post('/api/v1/admin/auth/change-password')
      .set('Authorization', `Bearer ${body.token}`)
      .send({ currentPassword: CHANGE_PASSWORD_ADMIN.password, newPassword: 'short' });

    expect(response.status).toBe(400);
  });

  it('rejects a new password identical to the current one', async () => {
    const { body } = await login(CHANGE_PASSWORD_ADMIN.email, CHANGE_PASSWORD_ADMIN.password);

    const response = await request(app)
      .post('/api/v1/admin/auth/change-password')
      .set('Authorization', `Bearer ${body.token}`)
      .send({
        currentPassword: CHANGE_PASSWORD_ADMIN.password,
        newPassword: CHANGE_PASSWORD_ADMIN.password,
      });

    expect(response.status).toBe(400);
  });

  it('changes the password and invalidates it for future logins', async () => {
    const { body } = await login(CHANGE_PASSWORD_ADMIN.email, CHANGE_PASSWORD_ADMIN.password);

    const response = await request(app)
      .post('/api/v1/admin/auth/change-password')
      .set('Authorization', `Bearer ${body.token}`)
      .send({ currentPassword: CHANGE_PASSWORD_ADMIN.password, newPassword: 'brand-new-pass-1' });

    expect(response.status).toBe(200);

    const oldPasswordLogin = await login(
      CHANGE_PASSWORD_ADMIN.email,
      CHANGE_PASSWORD_ADMIN.password
    );
    expect(oldPasswordLogin.status).toBe(401);

    const newPasswordLogin = await login(CHANGE_PASSWORD_ADMIN.email, 'brand-new-pass-1');
    expect(newPasswordLogin.status).toBe(200);
    expect(newPasswordLogin.body.mustChangePassword).toBe(false);
  });
});

describe('forgot / reset password flow', () => {
  const RESET_ADMIN = { email: 'reset-flow@test.com', password: 'starting-pass-1' };

  beforeAll(async () => {
    await Admin.create({
      email: RESET_ADMIN.email,
      passwordHash: await bcrypt.hash(RESET_ADMIN.password, 4),
      role: 'admin',
      isActive: true,
    });
  });

  it('always returns the same generic response, whether or not the account exists', async () => {
    const existing = await request(app)
      .post('/api/v1/admin/auth/forgot-password')
      .send({ email: RESET_ADMIN.email });

    const nonExistent = await request(app)
      .post('/api/v1/admin/auth/forgot-password')
      .send({ email: 'nobody-here@test.com' });

    expect(existing.status).toBe(200);
    expect(nonExistent.status).toBe(200);
    expect(existing.body.message).toBe(nonExistent.body.message);
  });

  it('does not send an email for an account that does not exist', async () => {
    sendPasswordResetEmailMock.mockClear();

    await request(app)
      .post('/api/v1/admin/auth/forgot-password')
      .send({ email: 'still-nobody@test.com' });

    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid or unknown reset token', async () => {
    const response = await request(app)
      .post('/api/v1/admin/auth/reset-password')
      .send({ token: 'not-a-real-token', newPassword: 'whatever-new-1' });

    expect(response.status).toBe(401);
  });

  it('resets the password with a valid token and single-uses it', async () => {
    sendPasswordResetEmailMock.mockClear();

    const forgotResponse = await request(app)
      .post('/api/v1/admin/auth/forgot-password')
      .send({ email: RESET_ADMIN.email });

    expect(forgotResponse.status).toBe(200);
    expect(sendPasswordResetEmailMock).toHaveBeenCalledTimes(1);

    const [, resetUrl] = sendPasswordResetEmailMock.mock.calls[0] as [string, string];
    const token = extractTokenFromResetUrl(resetUrl);

    const resetResponse = await request(app)
      .post('/api/v1/admin/auth/reset-password')
      .send({ token, newPassword: 'freshly-reset-1' });

    expect(resetResponse.status).toBe(200);

    const oldPasswordLogin = await login(RESET_ADMIN.email, RESET_ADMIN.password);
    expect(oldPasswordLogin.status).toBe(401);

    const newPasswordLogin = await login(RESET_ADMIN.email, 'freshly-reset-1');
    expect(newPasswordLogin.status).toBe(200);

    // The token must not be usable a second time.
    const reuseResponse = await request(app)
      .post('/api/v1/admin/auth/reset-password')
      .send({ token, newPassword: 'another-password-1' });

    expect(reuseResponse.status).toBe(401);
  });
});

describe('PATCH /api/v1/admin/admins/:id/force-password-reset', () => {
  const FORCE_RESET_ADMIN = { email: 'force-reset@test.com', password: 'before-reset-1' };

  it('lets a super admin force another admin to reset their password', async () => {
    const created = await Admin.create({
      email: FORCE_RESET_ADMIN.email,
      passwordHash: await bcrypt.hash(FORCE_RESET_ADMIN.password, 4),
      role: 'admin',
      isActive: true,
    });

    const { body: superLogin } = await login(SUPER_ADMIN.email, SUPER_ADMIN.password);

    // The admin logs in and holds a token before the forced reset, to prove
    // it gets invalidated afterwards.
    const { body: preResetLogin } = await login(
      FORCE_RESET_ADMIN.email,
      FORCE_RESET_ADMIN.password
    );

    const resetResponse = await request(app)
      .patch(`/api/v1/admin/admins/${created._id.toString()}/force-password-reset`)
      .set('Authorization', `Bearer ${superLogin.token}`);

    expect(resetResponse.status).toBe(200);
    expect(typeof resetResponse.body.temporaryPassword).toBe('string');
    expect(resetResponse.body.temporaryPassword.length).toBeGreaterThanOrEqual(8);

    // Old credentials no longer work.
    const oldPasswordLogin = await login(FORCE_RESET_ADMIN.email, FORCE_RESET_ADMIN.password);
    expect(oldPasswordLogin.status).toBe(401);

    // The pre-reset session token is now invalid (tokenVersion bumped).
    const staleSessionResponse = await request(app)
      .get('/api/v1/admin/books')
      .set('Authorization', `Bearer ${preResetLogin.token}`);
    expect(staleSessionResponse.status).toBe(401);

    // The temporary password logs in and flags mustChangePassword.
    const tempLogin = await login(FORCE_RESET_ADMIN.email, resetResponse.body.temporaryPassword);
    expect(tempLogin.status).toBe(200);
    expect(tempLogin.body.mustChangePassword).toBe(true);
  });

  it('rejects a super admin targeting their own account', async () => {
    const { body: superLogin } = await login(SUPER_ADMIN.email, SUPER_ADMIN.password);

    const response = await request(app)
      .patch(`/api/v1/admin/admins/${superLogin.admin.id}/force-password-reset`)
      .set('Authorization', `Bearer ${superLogin.token}`);

    expect(response.status).toBe(400);
  });

  it('is forbidden for a regular admin', async () => {
    const target = await Admin.create({
      email: 'force-reset-target@test.com',
      passwordHash: await bcrypt.hash('irrelevant-pass-1', 4),
      role: 'admin',
      isActive: true,
    });
    const { body: regularLogin } = await login(REGULAR_ADMIN.email, REGULAR_ADMIN.password);

    const response = await request(app)
      .patch(`/api/v1/admin/admins/${target._id.toString()}/force-password-reset`)
      .set('Authorization', `Bearer ${regularLogin.token}`);

    expect(response.status).toBe(403);
  });
});
