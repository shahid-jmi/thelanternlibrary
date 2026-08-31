import { describe, expect, it } from 'vitest';
import openApiDocument from './openapi.js';
import { upsertBookBodySchema } from '../modules/books/book.validators.js';
import { upsertProductBodySchema } from '../modules/products/product.validators.js';
import { updateOrderStatusBodySchema } from '../modules/orders/order.validators.js';

// The OpenAPI spec is hand-written rather than generated from the Zod
// validators, so nothing else catches it if the two drift apart — that
// already happened once (price gained `.int()` while the docs still said
// `type: 'number'`). These tests re-derive a couple of key constraints from
// the actual validators and assert the docs agree. Add a case here whenever
// a validator gains a constraint the docs need to mirror.
describe('OpenAPI spec matches validator constraints', () => {
  const schemas = openApiDocument.components.schemas;

  it('rejects a decimal price the same way the Book validator does', () => {
    const result = upsertBookBodySchema.safeParse({
      title: { en: 'A Book' },
      description: { en: 'A description' },
      author: 'An Author',
      price: 10.5,
      genre: 'fiction',
      language: 'english',
    });
    expect(result.success).toBe(false);

    expect(schemas.PublicBook.properties.price.type).toBe('integer');
    expect(schemas.AdminBook.properties.price.type).toBe('integer');
    expect(schemas.BookFormPayload.properties.price.type).toBe('integer');
  });

  it('rejects a decimal price the same way the Product validator does', () => {
    const result = upsertProductBodySchema.safeParse({
      name: { en: 'A Product' },
      description: { en: 'A description' },
      category: '507f1f77bcf86cd799439011',
      price: 10.5,
    });
    expect(result.success).toBe(false);

    expect(schemas.PublicProduct.properties.price.type).toBe('integer');
    expect(schemas.AdminProduct.properties.price.type).toBe('integer');
    expect(schemas.ProductFormPayload.properties.price.type).toBe('integer');
  });

  it('rejects a decimal deliveryCharge the same way the Order validator does', () => {
    const result = updateOrderStatusBodySchema.safeParse({
      status: 'paid',
      deliveryCharge: 10.5,
    });
    expect(result.success).toBe(false);

    expect(schemas.OrderStatusUpdate.properties.deliveryCharge.type).toBe('integer');
    expect(schemas.AdminOrder.properties.deliveryCharge.type).toBe('integer');
  });
});
