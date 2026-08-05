import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import createApp from '../app.js';
import Admin from '../modules/admin-auth/admin.model.js';
import Book, { type BookLean } from '../modules/books/book.model.js';
import Order from '../modules/orders/order.model.js';
import { startTestDatabase, stopTestDatabase } from './db.js';

const app = createApp();

const REGULAR_ADMIN = { email: 'admin@test.com', password: 'admin-secret-1' };

let adminToken = '';
let theAlchemist: BookLean;

const seedBooks = async () => {
  const created = await Book.create(
    {
      title: { en: 'The Alchemist', ur: 'الکیمسٹ' },
      description: { en: 'A shepherd boy journeys to find treasure.' },
      author: 'Paulo Coelho',
      price: 15.99,
      genre: 'fiction',
      language: 'english',
      coverImage: { url: 'https://covers.test.example.com/alchemist.webp', key: null },
      isAvailable: true,
    },
    {
      title: { en: 'A Brief History of Time' },
      description: { en: 'An exploration of cosmology.' },
      author: 'Stephen Hawking',
      price: 18.99,
      genre: 'science',
      language: 'english',
      coverImage: { url: 'https://covers.test.example.com/time.webp', key: null },
      isAvailable: true,
    }
  );
  theAlchemist = created[0].toObject() as unknown as BookLean;
};

const createOrderForBook = async (bookId: string) =>
  request(app).post('/api/v1/orders').send({
    book: bookId,
    customerName: 'Mehak',
    customerPhone: '+91-9876543210',
    addressLine: 'House 12, Lane 3, Near the Shiva Temple',
    locality: 'Rajbagh',
    city: 'Srinagar',
    state: 'Jammu and Kashmir',
    pincode: '190001',
  });

beforeAll(async () => {
  await startTestDatabase();

  await Admin.create({
    email: REGULAR_ADMIN.email,
    passwordHash: await bcrypt.hash(REGULAR_ADMIN.password, 4),
    role: 'admin',
    isActive: true,
  });

  const response = await request(app).post('/api/v1/admin/auth/login').send(REGULAR_ADMIN);
  adminToken = response.body.token as string;
});

afterAll(async () => {
  await stopTestDatabase();
});

beforeEach(async () => {
  await Order.deleteMany({});
  await Book.deleteMany({});
  await seedBooks();
});

describe('POST /api/v1/orders', () => {
  it('creates an order snapshotting the book title, author, and price', async () => {
    const response = await createOrderForBook(theAlchemist._id.toString());

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('pending');

    const stored = await Order.findOne({});
    expect(stored?.bookTitle).toBe('The Alchemist');
    expect(stored?.bookAuthor).toBe('Paulo Coelho');
    expect(stored?.price).toBe(15.99);
    expect(stored?.customerName).toBe('Mehak');
  });

  it('rejects a book that does not exist', async () => {
    const response = await createOrderForBook(new Types.ObjectId().toString());

    expect(response.status).toBe(400);
    expect(response.body.details[0].msg).toBe('Book does not exist');
    expect(await Order.countDocuments()).toBe(0);
  });

  it('rejects a missing address line', async () => {
    const response = await request(app).post('/api/v1/orders').send({
      book: theAlchemist._id.toString(),
      customerName: 'Mehak',
      customerPhone: '+91-9876543210',
      locality: 'Rajbagh',
      city: 'Srinagar',
      state: 'Jammu and Kashmir',
      pincode: '190001',
    });

    expect(response.status).toBe(400);
    expect(await Order.countDocuments()).toBe(0);
  });

  it('rejects a pincode that is not a 6-digit number', async () => {
    const response = await request(app).post('/api/v1/orders').send({
      book: theAlchemist._id.toString(),
      customerName: 'Mehak',
      customerPhone: '+91-9876543210',
      addressLine: 'House 12, Lane 3',
      locality: 'Rajbagh',
      city: 'Srinagar',
      state: 'Jammu and Kashmir',
      pincode: '1900',
    });

    expect(response.status).toBe(400);
    expect(response.body.details[0].msg).toBe('Pincode must be a 6-digit number');
    expect(await Order.countDocuments()).toBe(0);
  });

  it('rejects a state that is not a recognized Indian state', async () => {
    const response = await request(app).post('/api/v1/orders').send({
      book: theAlchemist._id.toString(),
      customerName: 'Mehak',
      customerPhone: '+91-9876543210',
      addressLine: 'House 12, Lane 3',
      locality: 'Rajbagh',
      city: 'Srinagar',
      state: 'Narnia',
      pincode: '190001',
    });

    expect(response.status).toBe(400);
    expect(await Order.countDocuments()).toBe(0);
  });
});

describe('GET /api/v1/admin/orders', () => {
  it('requires an admin token', async () => {
    const response = await request(app).get('/api/v1/admin/orders');
    expect(response.status).toBe(401);
  });

  it('lists orders newest-first by default', async () => {
    const [book2] = await Book.find({ title: { $ne: theAlchemist.title } });
    await createOrderForBook(theAlchemist._id.toString());
    await createOrderForBook(book2!._id.toString());

    const response = await request(app)
      .get('/api/v1/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].bookTitle).toBe('A Brief History of Time');
    expect(response.body[1].bookTitle).toBe('The Alchemist');
  });

  it('searches by book title', async () => {
    const [book2] = await Book.find({ title: { $ne: theAlchemist.title } });
    await createOrderForBook(theAlchemist._id.toString());
    await createOrderForBook(book2!._id.toString());

    const response = await request(app)
      .get('/api/v1/admin/orders')
      .query({ search: 'alchemist' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].bookTitle).toBe('The Alchemist');
  });

  it('searches by customer phone number', async () => {
    await createOrderForBook(theAlchemist._id.toString());

    const response = await request(app)
      .get('/api/v1/admin/orders')
      .query({ search: '9876543210' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});

describe('PATCH /api/v1/admin/orders/:id/status', () => {
  it('marks an order as paid', async () => {
    const created = await createOrderForBook(theAlchemist._id.toString());

    const response = await request(app)
      .patch(`/api/v1/admin/orders/${created.body._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'paid' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('paid');
  });
});

describe('GET /api/v1/admin/orders/:id/invoice', () => {
  it('rejects generating an invoice for an unpaid order', async () => {
    const created = await createOrderForBook(theAlchemist._id.toString());

    const response = await request(app)
      .get(`/api/v1/admin/orders/${created.body._id}/invoice`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('generates a PDF invoice once the order is paid, assigning a sequential invoice number', async () => {
    const created = await createOrderForBook(theAlchemist._id.toString());
    await request(app)
      .patch(`/api/v1/admin/orders/${created.body._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'paid' });

    const response = await request(app)
      .get(`/api/v1/admin/orders/${created.body._id}/invoice`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
    expect(response.body.length).toBeGreaterThan(0);

    const order = await Order.findById(created.body._id);
    expect(order?.invoiceNumber).toMatch(/^INV-\d{4}-0001$/);
  });
});
