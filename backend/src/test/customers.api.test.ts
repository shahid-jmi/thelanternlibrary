import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import createApp from '../app.js';
import Admin from '../modules/admin-auth/admin.model.js';
import Book, { type BookLean } from '../modules/books/book.model.js';
import Customer from '../modules/customers/customer.model.js';
import Order from '../modules/orders/order.model.js';
import { hashOneTimeToken } from '../modules/customers/customer.tokens.js';
import { startTestDatabase, stopTestDatabase } from './db.js';

const app = createApp();

const ADMIN = { email: 'admin@test.com', password: 'admin-secret-1' };
let adminToken = '';
let book: BookLean;

const register = (email = 'mehak@test.com', password = 'reader-pass-1') =>
  request(app).post('/api/v1/customer/register').send({ email, password, name: 'Mehak' });

const address = {
  name: 'Mehak',
  phone: '9876543210',
  addressLine: 'House 12, Lane 3',
  locality: 'Rajbagh',
  city: 'Srinagar',
  state: 'Jammu and Kashmir',
  pincode: '190001',
};

const placeOrder = (token?: string, email?: string) => {
  const req = request(app).post('/api/v1/orders');
  if (token) req.set('Authorization', `Bearer ${token}`);
  return req.send({
    items: [{ itemType: 'book', itemId: book._id.toString(), quantity: 1 }],
    customerName: 'Mehak',
    customerPhone: '9876543210',
    customerEmail: email,
    addressLine: address.addressLine,
    locality: address.locality,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  });
};

beforeAll(async () => {
  await startTestDatabase();
  await Admin.create({
    email: ADMIN.email,
    passwordHash: await bcrypt.hash(ADMIN.password, 4),
    role: 'admin',
    isActive: true,
  });
  adminToken = (await request(app).post('/api/v1/admin/auth/login').send(ADMIN)).body
    .token as string;
});

afterAll(async () => {
  await stopTestDatabase();
});

beforeEach(async () => {
  await Promise.all([Customer.deleteMany({}), Order.deleteMany({}), Book.deleteMany({})]);
  book = (
    await Book.create({
      title: { en: 'The Alchemist' },
      description: { en: 'A story.' },
      author: 'Paulo Coelho',
      price: 400,
      genre: 'fiction',
      language: 'english',
      coverImage: { url: 'https://covers.test.example.com/x.webp', key: null },
    })
  ).toObject() as unknown as BookLean;
});

describe('sign up and sign in', () => {
  it('registers, returns a session, and starts unverified', async () => {
    const response = await register();
    expect(response.status).toBe(201);
    expect(response.body.token).toBeTruthy();
    expect(response.body.customer).toMatchObject({ email: 'mehak@test.com', emailVerified: false });
    const stored = await Customer.findOne({}).lean();
    expect(stored?.passwordHash).not.toBe('reader-pass-1');
    expect(stored?.emailVerificationTokenHash).toBeTruthy();
  });

  it('rejects a duplicate email', async () => {
    await register();
    const response = await register('MEHAK@test.com');
    expect(response.status).toBe(409);
  });

  it('signs in with the right password only', async () => {
    await register();
    const wrong = await request(app)
      .post('/api/v1/customer/login')
      .send({ email: 'mehak@test.com', password: 'nope-nope-1' });
    expect(wrong.status).toBe(401);

    const right = await request(app)
      .post('/api/v1/customer/login')
      .send({ email: 'mehak@test.com', password: 'reader-pass-1' });
    expect(right.status).toBe(200);

    const me = await request(app)
      .get('/api/v1/customer/me')
      .set('Authorization', `Bearer ${right.body.token}`);
    expect(me.body.name).toBe('Mehak');
  });

  it('keeps customer and admin tokens apart', async () => {
    const { body } = await register();
    const asAdmin = await request(app)
      .get('/api/v1/admin/orders')
      .set('Authorization', `Bearer ${body.token}`);
    expect(asAdmin.status).toBe(401);

    const asCustomer = await request(app)
      .get('/api/v1/customer/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(asCustomer.status).toBe(401);
  });

  it('signs out other devices when the password changes', async () => {
    const { body } = await register();
    const changed = await request(app)
      .post('/api/v1/customer/change-password')
      .set('Authorization', `Bearer ${body.token}`)
      .send({ currentPassword: 'reader-pass-1', newPassword: 'reader-pass-2' });
    expect(changed.status).toBe(200);

    const old = await request(app)
      .get('/api/v1/customer/me')
      .set('Authorization', `Bearer ${body.token}`);
    expect(old.status).toBe(401);
    const fresh = await request(app)
      .get('/api/v1/customer/me')
      .set('Authorization', `Bearer ${changed.body.token}`);
    expect(fresh.status).toBe(200);
  });
});

describe('email verification and password reset', () => {
  it('verifies the email and links earlier guest orders placed with it', async () => {
    await placeOrder(undefined, 'mehak@test.com');
    await placeOrder(undefined, 'someone-else@test.com');
    await register();
    await Customer.updateOne(
      {},
      {
        emailVerificationTokenHash: hashOneTimeToken('verify-me'),
        emailVerificationExpiresAt: new Date(Date.now() + 60_000),
      }
    );

    const response = await request(app)
      .post('/api/v1/customer/verify-email')
      .send({ token: 'verify-me' });
    expect(response.status).toBe(200);
    expect(response.body.emailVerified).toBe(true);

    const customer = await Customer.findOne({}).lean();
    expect(await Order.countDocuments({ customer: customer!._id })).toBe(1);

    const again = await request(app)
      .post('/api/v1/customer/verify-email')
      .send({ token: 'verify-me' });
    expect(again.status).toBe(401);
  });

  it('answers forgot-password the same for unknown emails', async () => {
    const response = await request(app)
      .post('/api/v1/customer/forgot-password')
      .send({ email: 'nobody@test.com' });
    expect(response.status).toBe(200);
  });

  it('resets the password with a valid link and ends old sessions', async () => {
    const { body } = await register();
    await Customer.updateOne(
      {},
      {
        passwordResetTokenHash: hashOneTimeToken('reset-me'),
        passwordResetExpiresAt: new Date(Date.now() + 60_000),
      }
    );
    const reset = await request(app)
      .post('/api/v1/customer/reset-password')
      .send({ token: 'reset-me', newPassword: 'brand-new-pass' });
    expect(reset.status).toBe(200);

    const old = await request(app)
      .get('/api/v1/customer/me')
      .set('Authorization', `Bearer ${body.token}`);
    expect(old.status).toBe(401);

    const login = await request(app)
      .post('/api/v1/customer/login')
      .send({ email: 'mehak@test.com', password: 'brand-new-pass' });
    expect(login.status).toBe(200);
  });
});

describe('addresses', () => {
  it('makes the first address the default and moves the default when asked', async () => {
    const { body } = await register();
    const auth = { Authorization: `Bearer ${body.token}` };

    const first = await request(app).post('/api/v1/customer/addresses').set(auth).send(address);
    expect(first.status).toBe(201);
    expect(first.body.addresses[0].isDefault).toBe(true);

    const second = await request(app)
      .post('/api/v1/customer/addresses')
      .set(auth)
      .send({ ...address, label: 'Office', city: 'Delhi', state: 'Delhi', isDefault: true });
    expect(second.body.addresses.map((a: { isDefault: boolean }) => a.isDefault)).toEqual([
      false,
      true,
    ]);

    const officeId = second.body.addresses[1]._id as string;
    const removed = await request(app).delete(`/api/v1/customer/addresses/${officeId}`).set(auth);
    expect(removed.body.addresses).toHaveLength(1);
    expect(removed.body.addresses[0].isDefault).toBe(true);
  });

  it('validates addresses', async () => {
    const { body } = await register();
    const response = await request(app)
      .post('/api/v1/customer/addresses')
      .set('Authorization', `Bearer ${body.token}`)
      .send({ ...address, pincode: '12' });
    expect(response.status).toBe(400);
  });
});

describe('my orders', () => {
  it('links orders placed while signed in and keeps them private', async () => {
    const mehak = (await register()).body;
    const other = (await register('other@test.com')).body;
    const placed = await placeOrder(mehak.token);
    await placeOrder();

    const mine = await request(app)
      .get('/api/v1/customer/orders')
      .set('Authorization', `Bearer ${mehak.token}`);
    expect(mine.body.total).toBe(1);
    expect(mine.body.orders[0].orderNumber).toBe(placed.body.orderNumber);
    expect(mine.body.orders[0]).not.toHaveProperty('internalNotes');

    const notTheirs = await request(app)
      .get(`/api/v1/customer/orders/${placed.body._id}`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(notTheirs.status).toBe(404);

    const receipt = await request(app)
      .get(`/api/v1/customer/orders/${placed.body._id}/receipt`)
      .set('Authorization', `Bearer ${mehak.token}`);
    expect(receipt.status).toBe(400);
  });

  it('ignores an invalid token when placing an order (guest checkout)', async () => {
    const response = await placeOrder('not-a-real-token');
    expect(response.status).toBe(201);
    expect((await Order.findOne({}).lean())?.customer).toBeNull();
  });
});

describe('admin customers', () => {
  it('lists customers with order stats', async () => {
    const { body } = await register();
    const order = await placeOrder(body.token);
    await request(app)
      .patch(`/api/v1/admin/orders/${order.body._id}/payment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ paymentStatus: 'paid', method: 'upi' });

    const list = await request(app)
      .get('/api/v1/admin/customers?search=mehak')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(list.body.total).toBe(1);
    expect(list.body.customers[0]).toMatchObject({ orderCount: 1, totalSpent: order.body.total });

    const detail = await request(app)
      .get(`/api/v1/admin/customers/${body.customer._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(detail.body.orders).toHaveLength(1);
  });
});
