import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import createApp from '../app.js';
import Admin from '../modules/admin-auth/admin.model.js';
import Category, { type CategoryLean } from '../modules/categories/category.model.js';
import Product from '../modules/products/product.model.js';
import { PLACEHOLDER_COVER_URL } from '../common/services/cover-image.service.js';
import { startTestDatabase, stopTestDatabase } from './db.js';

const app = createApp();

const REGULAR_ADMIN = { email: 'admin@test.com', password: 'admin-secret-1' };

let adminToken = '';
let postcards: CategoryLean;
let retired: CategoryLean;

const seedCategories = async () => {
  const created = await Category.create(
    {
      name: { en: 'Postcards', ur: 'پوسٹ کارڈز' },
      slug: 'postcards',
      isActive: true,
    },
    {
      name: { en: 'Retired Section' },
      slug: 'retired-section',
      isActive: false,
    }
  );
  postcards = created[0].toObject() as unknown as CategoryLean;
  retired = created[1].toObject() as unknown as CategoryLean;
};

const seedProducts = () =>
  Product.create(
    {
      name: { en: 'Dal Lake at Dusk', ur: 'ڈل جھیل شام کے وقت' },
      description: { en: 'A hand-printed postcard.', ur: 'ہاتھ سے چھپا پوسٹ کارڈ۔' },
      category: postcards._id,
      price: 3.5,
      coverImage: { url: 'https://covers.test.example.com/p1.webp', key: null },
      isAvailable: true,
    },
    {
      name: { en: 'Chinar Leaf Print' },
      description: { en: 'A pressed chinar leaf postcard.' },
      category: postcards._id,
      price: 4,
      coverImage: { url: 'https://covers.test.example.com/p2.webp', key: null },
      isAvailable: false,
    },
    {
      name: { en: 'Old Stock Item' },
      description: { en: 'Belongs to a retired category.' },
      category: retired._id,
      price: 10,
      coverImage: { url: 'https://covers.test.example.com/p3.webp', key: null },
      isAvailable: true,
    }
  );

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
  // Keep the admin account; only reset catalog data between tests.
  await Product.deleteMany({});
  await Category.deleteMany({});
  await seedCategories();
});

describe('GET /api/v1/products', () => {
  it('returns products with localized names and category info', async () => {
    await seedProducts();

    const response = await request(app).get('/api/v1/products');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    const dalLake = response.body.find(
      (product: { name: string }) => product.name === 'Dal Lake at Dusk'
    );
    expect(dalLake.category.slug).toBe('postcards');
    expect(dalLake.category.name).toBe('Postcards');
  });

  it('localizes to Urdu with English fallback', async () => {
    await seedProducts();

    const response = await request(app).get('/api/v1/products').query({ lang: 'ur' });

    expect(response.status).toBe(200);
    const names = response.body.map((product: { name: string }) => product.name);
    expect(names).toContain('ڈل جھیل شام کے وقت');
    expect(names).toContain('Chinar Leaf Print');
  });

  it('filters by category slug', async () => {
    await seedProducts();

    const response = await request(app).get('/api/v1/products').query({ category: 'postcards' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('returns an empty list for unknown or inactive category slugs', async () => {
    await seedProducts();

    const unknown = await request(app).get('/api/v1/products').query({ category: 'no-such' });
    expect(unknown.status).toBe(200);
    expect(unknown.body).toHaveLength(0);

    const inactive = await request(app)
      .get('/api/v1/products')
      .query({ category: 'retired-section' });
    expect(inactive.status).toBe(200);
    expect(inactive.body).toHaveLength(0);
  });

  it('filters by availability', async () => {
    await seedProducts();

    const response = await request(app).get('/api/v1/products').query({ available: 'true' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
});

describe('GET /api/v1/products/:id', () => {
  it('returns a single localized product', async () => {
    const [product] = await seedProducts();

    const response = await request(app).get(`/api/v1/products/${product._id.toString()}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Dal Lake at Dusk');
    expect(response.body.category.slug).toBe('postcards');
  });

  it('returns 404 for a missing product', async () => {
    const response = await request(app).get(`/api/v1/products/${new Types.ObjectId().toString()}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Product not found');
  });

  it('returns 400 for a malformed id', async () => {
    const response = await request(app).get('/api/v1/products/not-an-id');

    expect(response.status).toBe(400);
    expect(response.body.details[0].msg).toBe('Invalid product id');
  });
});

describe('POST /api/v1/admin/products', () => {
  it('lets a regular admin create a product in an active category', async () => {
    const response = await request(app)
      .post('/api/v1/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', JSON.stringify({ en: 'Handwritten Letter', ur: 'ہاتھ سے لکھا خط' }))
      .field('description', JSON.stringify({ en: 'Ink, paper, and a little time.' }))
      .field('category', postcards._id.toString())
      .field('price', '12');

    expect(response.status).toBe(201);
    expect(response.body.name.en).toBe('Handwritten Letter');
    expect(response.body.category.slug).toBe('postcards');
    expect(response.body.isAvailable).toBe(true);
    expect(response.body.coverImage.url).toBe(PLACEHOLDER_COVER_URL);
    expect(response.body.coverImage.key).toBeNull();
  });

  it('rejects a category that does not exist', async () => {
    const response = await request(app)
      .post('/api/v1/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', JSON.stringify({ en: 'Orphan Product' }))
      .field('description', JSON.stringify({ en: 'Should not be created.' }))
      .field('category', new Types.ObjectId().toString())
      .field('price', '5');

    expect(response.status).toBe(400);
    expect(response.body.details[0].msg).toBe('Category does not exist');
    expect(await Product.countDocuments()).toBe(0);
  });

  it('rejects an inactive category', async () => {
    const response = await request(app)
      .post('/api/v1/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', JSON.stringify({ en: 'Retired Product' }))
      .field('description', JSON.stringify({ en: 'Should not be created.' }))
      .field('category', retired._id.toString())
      .field('price', '5');

    expect(response.status).toBe(400);
    expect(response.body.details[0].msg).toBe('Category is inactive; assign an active category');
    expect(await Product.countDocuments()).toBe(0);
  });

  it('rejects requests without a token', async () => {
    const response = await request(app).post('/api/v1/admin/products');

    expect(response.status).toBe(401);
  });
});

describe('PUT /api/v1/admin/products/:id', () => {
  it('updates a product', async () => {
    const [product] = await seedProducts();

    const response = await request(app)
      .put(`/api/v1/admin/products/${product._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', JSON.stringify({ en: 'Dal Lake at Dawn' }))
      .field('description', JSON.stringify({ en: 'A hand-printed postcard.' }))
      .field('category', postcards._id.toString())
      .field('price', '4.5');

    expect(response.status).toBe(200);
    expect(response.body.name.en).toBe('Dal Lake at Dawn');
    expect(response.body.price).toBe(4.5);
  });

  it('rejects moving a product into an inactive category', async () => {
    const [product] = await seedProducts();

    const response = await request(app)
      .put(`/api/v1/admin/products/${product._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', JSON.stringify({ en: 'Dal Lake at Dusk' }))
      .field('description', JSON.stringify({ en: 'A hand-printed postcard.' }))
      .field('category', retired._id.toString())
      .field('price', '3.5');

    expect(response.status).toBe(400);
    expect(response.body.details[0].msg).toBe('Category is inactive; assign an active category');
  });
});

describe('PATCH /api/v1/admin/products/:id/availability', () => {
  it('toggles availability', async () => {
    const [product] = await seedProducts();

    const response = await request(app)
      .patch(`/api/v1/admin/products/${product._id.toString()}/availability`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isAvailable: false });

    expect(response.status).toBe(200);
    expect(response.body.isAvailable).toBe(false);
  });
});

describe('DELETE /api/v1/admin/products/:id', () => {
  it('deletes a product', async () => {
    const [product] = await seedProducts();

    const response = await request(app)
      .delete(`/api/v1/admin/products/${product._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(await Product.findById(product._id)).toBeNull();
  });

  it('returns 404 for a missing product', async () => {
    const response = await request(app)
      .delete(`/api/v1/admin/products/${new Types.ObjectId().toString()}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });
});
