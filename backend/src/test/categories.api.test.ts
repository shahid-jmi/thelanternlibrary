import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import createApp from '../app.js';
import Admin from '../modules/admin-auth/admin.model.js';
import Category from '../modules/categories/category.model.js';
import Product from '../modules/products/product.model.js';
import { startTestDatabase, stopTestDatabase } from './db.js';

const app = createApp();

const SUPER_ADMIN = { email: 'super@test.com', password: 'super-secret-1' };
const REGULAR_ADMIN = { email: 'admin@test.com', password: 'admin-secret-1' };

let superToken = '';
let adminToken = '';

const login = async (email: string, password: string): Promise<string> => {
  const response = await request(app).post('/api/v1/admin/auth/login').send({ email, password });
  return response.body.token as string;
};

const seedCategories = () =>
  Category.create(
    {
      name: { en: 'Postcards', ur: 'پوسٹ کارڈز' },
      slug: 'postcards',
      tagline: { en: 'Small windows mailed from the valley.' },
      isActive: true,
    },
    {
      name: { en: 'Canvas Totes' },
      slug: 'canvas-totes',
      isActive: true,
    },
    {
      name: { en: 'Retired Section' },
      slug: 'retired-section',
      isActive: false,
    }
  );

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

  superToken = await login(SUPER_ADMIN.email, SUPER_ADMIN.password);
  adminToken = await login(REGULAR_ADMIN.email, REGULAR_ADMIN.password);
});

afterAll(async () => {
  await stopTestDatabase();
});

beforeEach(async () => {
  // Keep the admin accounts; only reset catalog data between tests.
  await Product.deleteMany({});
  await Category.deleteMany({});
});

describe('GET /api/v1/categories', () => {
  it('returns only active categories, localized with taglines', async () => {
    await seedCategories();

    const response = await request(app).get('/api/v1/categories');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    const slugs = response.body.map((category: { slug: string }) => category.slug);
    expect(slugs).toContain('postcards');
    expect(slugs).toContain('canvas-totes');
    expect(slugs).not.toContain('retired-section');

    const postcards = response.body.find(
      (category: { slug: string }) => category.slug === 'postcards'
    );
    expect(postcards.name).toBe('Postcards');
    expect(postcards.tagline).toBe('Small windows mailed from the valley.');
  });

  it('localizes to Urdu with English fallback', async () => {
    await seedCategories();

    const response = await request(app).get('/api/v1/categories').query({ lang: 'ur' });

    expect(response.status).toBe(200);
    const names = response.body.map((category: { name: string }) => category.name);
    expect(names).toContain('پوسٹ کارڈز');
    expect(names).toContain('Canvas Totes');
  });
});

describe('GET /api/v1/admin/categories', () => {
  it('lets any admin view all categories including inactive', async () => {
    await seedCategories();

    const response = await request(app)
      .get('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(typeof response.body[0].name.en).toBe('string');
  });

  it('rejects requests without a token', async () => {
    const response = await request(app).get('/api/v1/admin/categories');

    expect(response.status).toBe(401);
  });
});

describe('POST /api/v1/admin/categories', () => {
  const payload = {
    name: { en: 'Dried Flowers', ur: 'خشک پھول' },
    slug: 'dried-flowers',
    tagline: { en: "Kashmir's gardens, paused mid-bloom." },
  };

  it('rejects a regular admin', async () => {
    const response = await request(app)
      .post('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Super admin access required');
  });

  it('lets a super admin create a category, active by default', async () => {
    const response = await request(app)
      .post('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${superToken}`)
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.slug).toBe('dried-flowers');
    expect(response.body.isActive).toBe(true);
    expect(response.body.name.ur).toBe('خشک پھول');
  });

  it('rejects a duplicate slug with 409', async () => {
    await seedCategories();

    const response = await request(app)
      .post('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${superToken}`)
      .send({ ...payload, slug: 'postcards' });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('A category with this slug already exists');
  });

  it('rejects a malformed slug', async () => {
    const response = await request(app)
      .post('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${superToken}`)
      .send({ ...payload, slug: 'Not A Slug!' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });
});

describe('PUT /api/v1/admin/categories/:id', () => {
  it('lets a super admin rename and deactivate a category', async () => {
    const [postcards] = await seedCategories();

    const response = await request(app)
      .put(`/api/v1/admin/categories/${postcards._id.toString()}`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({
        name: { en: 'Picture Postcards' },
        slug: 'postcards',
        isActive: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.name.en).toBe('Picture Postcards');
    expect(response.body.isActive).toBe(false);
  });

  it('rejects a regular admin', async () => {
    const [postcards] = await seedCategories();

    const response = await request(app)
      .put(`/api/v1/admin/categories/${postcards._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: { en: 'Picture Postcards' }, slug: 'postcards' });

    expect(response.status).toBe(403);
  });

  it('returns 404 for a missing category', async () => {
    const response = await request(app)
      .put(`/api/v1/admin/categories/${new Types.ObjectId().toString()}`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ name: { en: 'Ghost' }, slug: 'ghost' });

    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/v1/admin/categories/:id', () => {
  it('blocks deleting a category that still has products assigned', async () => {
    const [postcards] = await seedCategories();
    await Product.create({
      name: { en: 'Dal Lake at Dusk' },
      description: { en: 'A hand-printed postcard.' },
      category: postcards._id,
      price: 3.5,
      coverImage: { url: 'https://covers.test.example.com/p.webp', key: null },
      isAvailable: true,
    });

    const response = await request(app)
      .delete(`/api/v1/admin/categories/${postcards._id.toString()}`)
      .set('Authorization', `Bearer ${superToken}`);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe(
      'This category still has 1 product assigned. Reassign or remove those products first.'
    );

    const stillThere = await Category.findById(postcards._id);
    expect(stillThere).not.toBeNull();
  });

  it('deletes an empty category', async () => {
    const [postcards] = await seedCategories();

    const response = await request(app)
      .delete(`/api/v1/admin/categories/${postcards._id.toString()}`)
      .set('Authorization', `Bearer ${superToken}`);

    expect(response.status).toBe(200);
    expect(await Category.findById(postcards._id)).toBeNull();
  });

  it('rejects a regular admin', async () => {
    const [postcards] = await seedCategories();

    const response = await request(app)
      .delete(`/api/v1/admin/categories/${postcards._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(403);
  });
});
