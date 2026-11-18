import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import createApp from '../app.js';
import Admin from '../modules/admin-auth/admin.model.js';
import Book, { type BookLean } from '../modules/books/book.model.js';
import Category from '../modules/categories/category.model.js';
import Product, { type ProductLean } from '../modules/products/product.model.js';
import Order from '../modules/orders/order.model.js';
import StockMovement from '../modules/inventory/stockMovement.model.js';
import Counter from '../common/models/counter.js';
import StoreSettings from '../modules/settings/settings.model.js';
import { startTestDatabase, stopTestDatabase } from './db.js';

const app = createApp();

const SUPER_ADMIN = { email: 'super@test.com', password: 'super-secret-1' };
const REGULAR_ADMIN = { email: 'admin@test.com', password: 'admin-secret-1' };

let adminToken = '';
let superToken = '';
let alchemist: BookLean;
let hawking: BookLean;
let postcard: ProductLean;

const auth = (token = adminToken) => ({ Authorization: `Bearer ${token}` });

const customer = {
  customerName: 'Mehak',
  customerPhone: '+91-9876543210',
  addressLine: 'House 12, Lane 3, Near the Shiva Temple',
  locality: 'Rajbagh',
  city: 'Srinagar',
  state: 'Jammu and Kashmir',
  pincode: '190001',
};

type Line = { itemType: 'book' | 'product'; itemId: string; quantity: number };

const placeOrder = (items: Line[], overrides: Record<string, unknown> = {}) =>
  request(app)
    .post('/api/v1/orders')
    .send({ items, ...customer, ...overrides });

const bookLine = (book: BookLean, quantity = 1): Line => ({
  itemType: 'book',
  itemId: book._id.toString(),
  quantity,
});

const markPaid = (id: string, method = 'upi') =>
  request(app)
    .patch(`/api/v1/admin/orders/${id}/payment`)
    .set(auth())
    .send({ paymentStatus: 'paid', method });

const setStatus = (id: string, body: Record<string, unknown>) =>
  request(app).patch(`/api/v1/admin/orders/${id}/status`).set(auth()).send(body);

const stockOf = async (id: Types.ObjectId) => (await Book.findById(id).lean())?.stock;

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

  adminToken = (await request(app).post('/api/v1/admin/auth/login').send(REGULAR_ADMIN)).body
    .token as string;
  superToken = (await request(app).post('/api/v1/admin/auth/login').send(SUPER_ADMIN)).body
    .token as string;
});

afterAll(async () => {
  await stopTestDatabase();
});

beforeEach(async () => {
  await Promise.all([
    Order.deleteMany({}),
    Book.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    StockMovement.deleteMany({}),
    Counter.deleteMany({}),
    StoreSettings.deleteMany({}),
  ]);

  const cover = { url: 'https://covers.test.example.com/x.webp', key: null };
  const [a, h] = await Book.create(
    {
      title: { en: 'The Alchemist' },
      description: { en: 'A shepherd boy journeys to find treasure.' },
      author: 'Paulo Coelho',
      price: 400,
      genre: 'fiction',
      language: 'english',
      coverImage: cover,
      stock: 3,
    },
    {
      title: { en: 'A Brief History of Time' },
      description: { en: 'An exploration of cosmology.' },
      author: 'Stephen Hawking',
      price: 600,
      genre: 'science',
      language: 'english',
      coverImage: cover,
      // stock left untracked
    }
  );
  alchemist = a!.toObject() as unknown as BookLean;
  hawking = h!.toObject() as unknown as BookLean;

  const category = await Category.create({
    name: { en: 'Postcards' },
    slug: 'postcards',
    shippingClass: 'light',
  });
  const created = await Product.create({
    name: { en: 'Dal Lake Postcard' },
    description: { en: 'A postcard.' },
    category: category._id,
    price: 150,
    coverImage: cover,
    stock: 10,
  });
  postcard = created.toObject() as unknown as ProductLean;
});

describe('POST /api/v1/orders', () => {
  it('creates a multi-item order priced from the database with delivery', async () => {
    const response = await placeOrder([
      bookLine(alchemist, 2),
      { itemType: 'product', itemId: postcard._id.toString(), quantity: 1 },
    ]);

    expect(response.status).toBe(201);
    expect(response.body.orderNumber).toBe('LL-1001');
    expect(response.body.subtotal).toBe(950);
    // J&K is local; heaviest class is standard (50) + 1 item beyond the 2 included (20).
    expect(response.body.deliveryCharge).toBe(70);
    expect(response.body.total).toBe(1020);

    const stored = await Order.findOne({}).lean();
    expect(stored?.items).toHaveLength(2);
    expect(stored?.items[1]?.shippingClass).toBe('light');
    expect(stored?.status).toBe('placed');
    expect(stored?.paymentStatus).toBe('unpaid');
    // Stock is only taken once payment is recorded.
    expect(await stockOf(alchemist._id)).toBe(3);
  });

  it('still accepts the old single-book payload', async () => {
    const response = await request(app)
      .post('/api/v1/orders')
      .send({ book: alchemist._id.toString(), ...customer });

    expect(response.status).toBe(201);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].title).toBe('The Alchemist');
  });

  it('merges duplicate lines for the same item', async () => {
    const response = await placeOrder([bookLine(alchemist), bookLine(alchemist)]);
    expect(response.status).toBe(201);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].quantity).toBe(2);
  });

  it('gives free delivery above the threshold', async () => {
    const response = await placeOrder([bookLine(hawking, 3)]);
    expect(response.body.subtotal).toBe(1800);
    expect(response.body.deliveryCharge).toBe(0);
  });

  it('rejects more copies than are in stock', async () => {
    const response = await placeOrder([bookLine(alchemist, 4)]);
    expect(response.status).toBe(409);
    expect(response.body.details[0].msg).toBe('Only 3 left of The Alchemist');
    expect(await Order.countDocuments()).toBe(0);
  });

  it('rejects an item that does not exist or is hidden', async () => {
    await Book.updateOne({ _id: hawking._id }, { isAvailable: false });
    const response = await placeOrder([
      { itemType: 'book', itemId: new Types.ObjectId().toString(), quantity: 1 },
      bookLine(hawking),
    ]);
    expect(response.status).toBe(400);
    expect(response.body.details).toHaveLength(2);
  });

  it('rejects a pincode that is not a 6-digit number', async () => {
    const response = await placeOrder([bookLine(alchemist)], { pincode: '1900' });
    expect(response.status).toBe(400);
    expect(response.body.details[0].msg).toBe('Pincode must be a 6-digit number');
  });
});

describe('POST /api/v1/orders/quote', () => {
  it('prices the cart and flags lines that cannot be ordered', async () => {
    const response = await request(app)
      .post('/api/v1/orders/quote')
      .send({ items: [bookLine(alchemist, 5), bookLine(hawking)], state: 'Delhi' });

    expect(response.status).toBe(200);
    expect(response.body.canOrder).toBe(false);
    expect(response.body.lines[0].problem).toBe('Only 3 left of The Alchemist');
    expect(response.body.subtotal).toBe(600);
    expect(response.body.deliveryRegion).toBe('domestic');
    expect(response.body.deliveryCharge).toBe(90);
    expect(response.body.freeDeliveryRemaining).toBe(900);
  });
});

describe('admin order list', () => {
  it('requires an admin token', async () => {
    const response = await request(app).get('/api/v1/admin/orders');
    expect(response.status).toBe(401);
  });

  it('pages, filters by view, and searches item titles', async () => {
    const first = await placeOrder([bookLine(alchemist)]);
    await placeOrder([bookLine(hawking)]);
    await markPaid(first.body._id);
    await setStatus(first.body._id, { status: 'shipped', courier: 'India Post' });

    const all = await request(app).get('/api/v1/admin/orders').set(auth());
    expect(all.body.total).toBe(2);
    expect(all.body.orders[0].items[0].title).toBe('A Brief History of Time');

    const toShip = await request(app).get('/api/v1/admin/orders?view=to_ship').set(auth());
    expect(toShip.body.orders).toHaveLength(1);

    const search = await request(app).get('/api/v1/admin/orders?search=alchemist').set(auth());
    expect(search.body.orders).toHaveLength(1);
    expect(search.body.orders[0].status).toBe('shipped');

    const counts = await request(app).get('/api/v1/admin/orders/counts').set(auth());
    expect(counts.body).toMatchObject({ all: 2, to_ship: 1, shipped: 1, unpaid: 1 });
  });
});

describe('payment and stock', () => {
  it('takes stock when payment is recorded and logs who did it', async () => {
    const order = await placeOrder([bookLine(alchemist, 2), bookLine(hawking)]);
    const response = await markPaid(order.body._id);

    expect(response.status).toBe(200);
    expect(response.body.paymentStatus).toBe('paid');
    expect(response.body.items.map((i: { stockDeducted: boolean }) => i.stockDeducted)).toEqual([
      true,
      false,
    ]);
    expect(await stockOf(alchemist._id)).toBe(1);

    const movement = await StockMovement.findOne({ reason: 'order_paid' }).lean();
    expect(movement?.delta).toBe(-2);
    expect(movement?.byEmail).toBe(REGULAR_ADMIN.email);
  });

  it('requires a payment method', async () => {
    const order = await placeOrder([bookLine(alchemist)]);
    const response = await request(app)
      .patch(`/api/v1/admin/orders/${order.body._id}/payment`)
      .set(auth())
      .send({ paymentStatus: 'paid' });
    expect(response.status).toBe(400);
  });

  it('flags the order when there is no longer enough stock, and resolves after restocking', async () => {
    const first = await placeOrder([bookLine(alchemist, 3)]);
    const second = await placeOrder([bookLine(alchemist, 2)]);
    await markPaid(first.body._id);

    const paid = await markPaid(second.body._id);
    expect(paid.body.paymentStatus).toBe('paid');
    expect(paid.body.needsAttention).toBe(true);
    expect(paid.body.stockPending).toBe(true);
    expect(await stockOf(alchemist._id)).toBe(0);

    const tooEarly = await request(app)
      .post(`/api/v1/admin/orders/${second.body._id}/resolve`)
      .set(auth())
      .send({});
    expect(tooEarly.status).toBe(409);

    await request(app)
      .post(`/api/v1/admin/inventory/book/${alchemist._id.toString()}/adjustments`)
      .set(auth())
      .send({ mode: 'add', quantity: 5 });

    const resolved = await request(app)
      .post(`/api/v1/admin/orders/${second.body._id}/resolve`)
      .set(auth())
      .send({});
    expect(resolved.status).toBe(200);
    expect(resolved.body.needsAttention).toBe(false);
    expect(await stockOf(alchemist._id)).toBe(3);
  });

  it('puts stock back when a paid order is cancelled and asks for a refund', async () => {
    const order = await placeOrder([bookLine(alchemist, 2)]);
    await markPaid(order.body._id);

    const cancelled = await setStatus(order.body._id, { status: 'cancelled' });
    expect(cancelled.body.status).toBe('cancelled');
    expect(cancelled.body.needsAttention).toBe(true);
    expect(await stockOf(alchemist._id)).toBe(3);

    const refunded = await request(app)
      .patch(`/api/v1/admin/orders/${order.body._id}/payment`)
      .set(auth())
      .send({ paymentStatus: 'refunded' });
    expect(refunded.body.paymentStatus).toBe('refunded');
    expect(refunded.body.needsAttention).toBe(false);
  });

  it('puts stock back when a payment is reverted', async () => {
    const order = await placeOrder([bookLine(alchemist)]);
    await markPaid(order.body._id);
    const reverted = await request(app)
      .patch(`/api/v1/admin/orders/${order.body._id}/payment`)
      .set(auth())
      .send({ paymentStatus: 'unpaid' });
    expect(reverted.body.paymentStatus).toBe('unpaid');
    expect(await stockOf(alchemist._id)).toBe(3);
  });
});

describe('status changes', () => {
  it('will not ship an unpaid order', async () => {
    const order = await placeOrder([bookLine(alchemist)]);
    const response = await setStatus(order.body._id, { status: 'shipped', courier: 'DTDC' });
    expect(response.status).toBe(400);
  });

  it('records courier details and the timeline when shipping', async () => {
    const order = await placeOrder([bookLine(alchemist)]);
    await markPaid(order.body._id);
    const response = await setStatus(order.body._id, {
      status: 'shipped',
      courier: 'India Post',
      trackingNumber: 'EK123456789IN',
    });

    expect(response.status).toBe(200);
    expect(response.body.shipment.courier).toBe('India Post');
    expect(response.body.shipment.shippedAt).toBeTruthy();
    expect(response.body.statusHistory.map((e: { status: string }) => e.status)).toEqual([
      'placed',
      'shipped',
    ]);
  });

  it('requires a courier when shipping', async () => {
    const order = await placeOrder([bookLine(alchemist)]);
    await markPaid(order.body._id);
    const response = await setStatus(order.body._id, { status: 'shipped' });
    expect(response.status).toBe(400);
  });

  it('rejects transitions that are not allowed', async () => {
    const order = await placeOrder([bookLine(alchemist)]);
    const response = await setStatus(order.body._id, { status: 'delivered' });
    expect(response.status).toBe(400);
  });

  it('lets the delivery charge change only before payment', async () => {
    const order = await placeOrder([bookLine(alchemist)]);
    const changed = await request(app)
      .patch(`/api/v1/admin/orders/${order.body._id}/delivery-charge`)
      .set(auth())
      .send({ deliveryCharge: 120 });
    expect(changed.body.total).toBe(520);

    await markPaid(order.body._id);
    const late = await request(app)
      .patch(`/api/v1/admin/orders/${order.body._id}/delivery-charge`)
      .set(auth())
      .send({ deliveryCharge: 10 });
    expect(late.status).toBe(400);
  });

  it('adds internal notes', async () => {
    const order = await placeOrder([bookLine(alchemist)]);
    const response = await request(app)
      .post(`/api/v1/admin/orders/${order.body._id}/notes`)
      .set(auth())
      .send({ text: 'Customer asked for gift wrap' });
    expect(response.status).toBe(201);
    expect(response.body.internalNotes[0].text).toBe('Customer asked for gift wrap');
  });
});

describe('receipts', () => {
  it('rejects a receipt for an unpaid order', async () => {
    const order = await placeOrder([bookLine(alchemist)]);
    const response = await request(app)
      .get(`/api/v1/admin/orders/${order.body._id}/receipt`)
      .set(auth());
    expect(response.status).toBe(400);
  });

  it('issues sequential receipt numbers once and reuses them', async () => {
    const first = await placeOrder([bookLine(alchemist)]);
    const second = await placeOrder([bookLine(hawking)]);
    await markPaid(first.body._id);
    await markPaid(second.body._id);

    const response = await request(app)
      .get(`/api/v1/admin/orders/${first.body._id}/receipt`)
      .set(auth());
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');

    await request(app).get(`/api/v1/admin/orders/${second.body._id}/receipt`).set(auth());
    await request(app).get(`/api/v1/admin/orders/${first.body._id}/receipt`).set(auth());

    const [a, b] = await Promise.all([
      Order.findById(first.body._id).lean(),
      Order.findById(second.body._id).lean(),
    ]);
    expect(a?.receipt?.number).toMatch(/^LL\/\d{4}-\d{2}\/0001$/);
    expect(b?.receipt?.number).toMatch(/^LL\/\d{4}-\d{2}\/0002$/);
  });
});

describe('inventory', () => {
  it('adjusts stock and keeps a history', async () => {
    const path = `/api/v1/admin/inventory/book/${alchemist._id.toString()}`;
    await request(app).post(`${path}/adjustments`).set(auth()).send({ mode: 'add', quantity: 4 });
    const removed = await request(app)
      .post(`${path}/adjustments`)
      .set(auth())
      .send({ mode: 'remove', quantity: 2, note: 'Sold in shop' });
    expect(removed.body.stock).toBe(5);

    const tooMany = await request(app)
      .post(`${path}/adjustments`)
      .set(auth())
      .send({ mode: 'remove', quantity: 9 });
    expect(tooMany.status).toBe(409);

    const history = await request(app).get(`${path}/movements`).set(auth());
    expect(history.body.map((m: { reason: string }) => m.reason)).toEqual(['shop_sale', 'restock']);
  });

  it('starts tracking an untracked item when stock is added', async () => {
    const response = await request(app)
      .post(`/api/v1/admin/inventory/book/${hawking._id.toString()}/adjustments`)
      .set(auth())
      .send({ mode: 'add', quantity: 2 });
    expect(response.body.stock).toBe(2);
    expect(response.body.stockStatus).toBe('low_stock');
  });

  it('lists low and out-of-stock items', async () => {
    await Book.updateOne({ _id: alchemist._id }, { stock: 0 });
    const response = await request(app).get('/api/v1/admin/inventory?status=attention').set(auth());
    expect(response.body).toHaveLength(1);
    expect(response.body[0].stockStatus).toBe('out_of_stock');
  });

  it('shows stock status on the public catalogue', async () => {
    await Book.updateOne({ _id: alchemist._id }, { stock: 1 });
    const response = await request(app).get(`/api/v1/books/${alchemist._id.toString()}`);
    expect(response.body.stockStatus).toBe('low_stock');
    expect(response.body.stockRemaining).toBe(1);
  });
});

describe('settings and dashboard', () => {
  it('only lets a super admin change delivery settings, and uses them for new orders', async () => {
    const current = await request(app).get('/api/v1/admin/settings').set(auth());
    const body = {
      ...current.body,
      delivery: { ...current.body.delivery, freeDeliveryThreshold: null },
    };

    const forbidden = await request(app).put('/api/v1/admin/settings').set(auth()).send(body);
    expect(forbidden.status).toBe(403);

    const saved = await request(app).put('/api/v1/admin/settings').set(auth(superToken)).send(body);
    expect(saved.status).toBe(200);

    const order = await placeOrder([bookLine(hawking, 3)]);
    // No free delivery now: local standard 50 + 1 extra item × 20.
    expect(order.body.deliveryCharge).toBe(70);
  });

  it('summarises orders, revenue, and stock', async () => {
    const order = await placeOrder([bookLine(alchemist)]);
    await placeOrder([bookLine(hawking)]);
    await markPaid(order.body._id);
    await Book.updateOne({ _id: hawking._id }, { stock: 0 });

    const response = await request(app).get('/api/v1/admin/dashboard').set(auth());
    expect(response.body.orders).toMatchObject({ toShip: 2, unpaid: 1, placedToday: 2 });
    expect(response.body.revenue.today).toBe(order.body.total);
    expect(response.body.stock.outOfStock).toBe(1);
  });
});
