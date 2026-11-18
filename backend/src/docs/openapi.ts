import { ADMIN_ROLES } from '../modules/admins/admin.constants.js';
import {
  BOOK_GENRES,
  BOOK_LANGUAGES,
  TRANSLATION_LANGUAGES,
} from '../modules/books/book.constants.js';
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from '../modules/orders/order.model.js';
import { ORDER_VIEWS } from '../modules/orders/order.validators.js';
import { ITEM_TYPES, SHIPPING_CLASSES, STOCK_STATUSES } from '../common/constants/catalog.js';
import { MANUAL_STOCK_REASONS, STOCK_REASONS } from '../modules/inventory/stockMovement.model.js';
import { INDIAN_STATES } from '../modules/orders/order.constants.js';

const errorResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
});

const bookIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string', pattern: '^[a-fA-F\\d]{24}$' },
  description: 'MongoDB ObjectId of the book',
};

const adminIdParam = {
  ...bookIdParam,
  description: 'MongoDB ObjectId of the admin',
};

const productIdParam = {
  ...bookIdParam,
  description: 'MongoDB ObjectId of the product',
};

const categoryIdParam = {
  ...bookIdParam,
  description: 'MongoDB ObjectId of the category',
};

const categorySlugParam = {
  name: 'slug',
  in: 'path',
  required: true,
  schema: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
  description: 'Slug of the category',
};

const orderIdParam = {
  ...bookIdParam,
  description: 'MongoDB ObjectId of the order',
};

const itemParams = [
  {
    name: 'itemType',
    in: 'path',
    required: true,
    schema: { type: 'string', enum: [...ITEM_TYPES] },
  },
  { ...bookIdParam, description: 'MongoDB ObjectId of the book or product' },
];

const bearer = [{ bearerAuth: [] }];

const jsonBody = (ref: string) => ({
  required: true,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${ref}` } } },
});

const jsonResponse = (description: string, ref: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${ref}` } } },
});

const adminOrderAction = (summary: string, bodyRef: string | null, errors: string) => ({
  tags: ['Admin Orders'],
  summary,
  security: bearer,
  parameters: [orderIdParam],
  ...(bodyRef ? { requestBody: jsonBody(bodyRef) } : {}),
  responses: {
    200: jsonResponse('Updated order', 'AdminOrder'),
    400: errorResponse(errors),
    401: errorResponse('Missing or invalid token'),
    404: errorResponse('Order not found'),
    409: errorResponse('The order changed meanwhile, or there is not enough stock'),
  },
});

const stockStatusProps = {
  stockStatus: {
    type: 'string',
    enum: [...STOCK_STATUSES],
    description: '"untracked" = stock is not counted for this item; always orderable',
  },
  stockRemaining: {
    type: 'integer',
    nullable: true,
    description: 'Copies left, only when stock is low',
  },
};

const adminStockProps = {
  ...stockStatusProps,
  stock: { type: 'integer', nullable: true, description: 'null = not tracked' },
  lowStockThreshold: {
    type: 'integer',
    nullable: true,
    description: 'null = store default',
  },
  shippingClass: { type: 'string', enum: [...SHIPPING_CLASSES], nullable: true },
};

const stockFormProps = {
  stock: { type: 'string', description: 'Whole number, or empty to stop tracking stock' },
  lowStockThreshold: {
    type: 'string',
    description: 'Whole number, or empty for the store default',
  },
  shippingClass: { type: 'string', enum: ['', ...SHIPPING_CLASSES] },
};

const langQueryParam = {
  name: 'lang',
  in: 'query',
  required: false,
  schema: { type: 'string', enum: [...TRANSLATION_LANGUAGES], default: 'en' },
  description: 'Translation language for localized fields',
};

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'The Lantern Library API',
    version: '1.0.0',
    description:
      'REST API for The Lantern Library bookstore. Public endpoints serve the storefront; admin endpoints require a bearer token obtained via the login endpoint.',
  },
  servers: [{ url: '/api/v1' }],
  tags: [
    { name: 'Books', description: 'Public storefront catalogue' },
    { name: 'Products', description: 'Public non-book catalogue (postcards, totes, etc.)' },
    { name: 'Categories', description: 'Public product categories for storefront navigation' },
    { name: 'Orders', description: 'Public order placement' },
    { name: 'Instagram', description: "Recent posts from the shop's Instagram account" },
    { name: 'Auth', description: 'Admin authentication' },
    { name: 'Admin Books', description: 'Book management (admin token required)' },
    { name: 'Admin Products', description: 'Product management (admin token required)' },
    {
      name: 'Admin Categories',
      description:
        'Category taxonomy. Any admin can list; create/update/delete require a super admin token.',
    },
    { name: 'Admins', description: 'Admin account management (super admin token required)' },
    {
      name: 'Admin Orders',
      description:
        'Order management, payments, status updates, and receipts (admin token required)',
    },
    {
      name: 'Admin Inventory',
      description: 'Stock levels and stock history (admin token required)',
    },
    { name: 'Admin Settings', description: 'Store, delivery, and inventory settings' },
    { name: 'Admin Dashboard', description: 'Summary numbers for the admin home page' },
    {
      name: 'Customer Account',
      description: 'Customer sign-up, sign-in, addresses and own orders (customer token)',
    },
    { name: 'Admin Customers', description: 'Read-only customer list for the shop' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                msg: { type: 'string' },
              },
            },
          },
        },
        required: ['message'],
      },
      LocalizedText: {
        type: 'object',
        properties: {
          en: { type: 'string' },
          ur: { type: 'string' },
        },
        required: ['en'],
      },
      CoverImage: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          key: { type: 'string', nullable: true },
        },
        required: ['url'],
      },
      PublicBook: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', description: 'Localized to the requested lang' },
          description: { type: 'string', description: 'Localized to the requested lang' },
          author: { type: 'string' },
          price: { type: 'integer', minimum: 0 },
          genre: { type: 'string', enum: [...BOOK_GENRES] },
          language: { type: 'string', enum: [...BOOK_LANGUAGES] },
          coverImage: { $ref: '#/components/schemas/CoverImage' },
          isAvailable: { type: 'boolean' },
          isFeatured: { type: 'boolean' },
          ...stockStatusProps,
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AdminBook: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { $ref: '#/components/schemas/LocalizedText' },
          description: { $ref: '#/components/schemas/LocalizedText' },
          author: { type: 'string' },
          price: { type: 'integer', minimum: 0 },
          genre: { type: 'string', enum: [...BOOK_GENRES] },
          language: { type: 'string', enum: [...BOOK_LANGUAGES] },
          coverImage: { $ref: '#/components/schemas/CoverImage' },
          isAvailable: { type: 'boolean' },
          isFeatured: { type: 'boolean' },
          ...adminStockProps,
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Admin: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: [...ADMIN_ROLES] },
          isActive: { type: 'boolean' },
          createdBy: { type: 'string', nullable: true },
          lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
          mustChangePassword: {
            type: 'boolean',
            description: 'True until the admin sets their own password for the first time',
          },
          passwordChangedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT bearer token, valid for 24 hours' },
          mustChangePassword: {
            type: 'boolean',
            description: 'If true, the frontend should redirect to the change-password page',
          },
          admin: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', enum: [...ADMIN_ROLES] },
            },
            required: ['id', 'email', 'role'],
          },
        },
        required: ['token', 'mustChangePassword', 'admin'],
      },
      MessageResponse: {
        type: 'object',
        properties: { message: { type: 'string' } },
        required: ['message'],
      },
      PublicCategory: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', description: 'Localized to the requested lang' },
          slug: { type: 'string' },
          tagline: {
            type: 'string',
            nullable: true,
            description: 'Localized to the requested lang',
          },
          description: {
            type: 'string',
            nullable: true,
            description:
              'Longer copy for the category detail page, localized to the requested lang',
          },
          coverImage: { $ref: '#/components/schemas/CoverImage' },
        },
      },
      InstagramPost: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          caption: { type: 'string', nullable: true },
          mediaType: { type: 'string', enum: ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'] },
          imageUrl: {
            type: 'string',
            description: 'Photo, first carousel slide, or video cover frame',
          },
          permalink: { type: 'string', description: 'Link to the post on Instagram' },
          likeCount: { type: 'integer', nullable: true },
          timestamp: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'mediaType', 'imageUrl', 'permalink', 'timestamp'],
      },
      AdminCategory: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { $ref: '#/components/schemas/LocalizedText' },
          slug: { type: 'string' },
          tagline: {
            allOf: [{ $ref: '#/components/schemas/LocalizedText' }],
            nullable: true,
          },
          description: {
            allOf: [{ $ref: '#/components/schemas/LocalizedText' }],
            nullable: true,
          },
          coverImage: { $ref: '#/components/schemas/CoverImage' },
          isActive: { type: 'boolean' },
          shippingClass: { type: 'string', enum: [...SHIPPING_CLASSES] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CategoryFormPayload: {
        type: 'object',
        description:
          'multipart/form-data payload. name and tagline are JSON-encoded LocalizedText strings.',
        properties: {
          name: { type: 'string', description: 'JSON-encoded LocalizedText' },
          slug: {
            type: 'string',
            pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
            maxLength: 60,
            description: 'Stable machine-safe identifier used for filtering',
          },
          tagline: { type: 'string', description: 'JSON-encoded LocalizedText, optional' },
          description: { type: 'string', description: 'JSON-encoded LocalizedText, optional' },
          isActive: { type: 'string', enum: ['true', 'false'] },
          coverImage: {
            type: 'string',
            format: 'binary',
            description: 'JPG, PNG, or WEBP up to 2MB. Optional — falls back to a placeholder.',
          },
        },
        required: ['name', 'slug'],
      },
      PublicProduct: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', description: 'Localized to the requested lang' },
          description: { type: 'string', description: 'Localized to the requested lang' },
          price: { type: 'integer', minimum: 0 },
          category: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string', description: 'Localized to the requested lang' },
              slug: { type: 'string' },
            },
          },
          coverImage: { $ref: '#/components/schemas/CoverImage' },
          isAvailable: { type: 'boolean' },
          isFeatured: { type: 'boolean' },
          ...stockStatusProps,
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AdminProduct: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { $ref: '#/components/schemas/LocalizedText' },
          description: { $ref: '#/components/schemas/LocalizedText' },
          price: { type: 'integer', minimum: 0 },
          category: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { $ref: '#/components/schemas/LocalizedText' },
              slug: { type: 'string' },
              isActive: { type: 'boolean' },
            },
          },
          coverImage: { $ref: '#/components/schemas/CoverImage' },
          isAvailable: { type: 'boolean' },
          isFeatured: { type: 'boolean' },
          ...adminStockProps,
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ProductFormPayload: {
        type: 'object',
        description:
          'multipart/form-data payload. name and description are JSON-encoded LocalizedText strings.',
        properties: {
          name: { type: 'string', description: 'JSON-encoded LocalizedText' },
          description: { type: 'string', description: 'JSON-encoded LocalizedText' },
          category: {
            type: 'string',
            pattern: '^[a-fA-F\\d]{24}$',
            description: 'ObjectId of an existing, active category',
          },
          price: { type: 'integer', minimum: 0 },
          isAvailable: { type: 'string', enum: ['true', 'false'] },
          isFeatured: { type: 'string', enum: ['true', 'false'] },
          ...stockFormProps,
          coverImage: {
            type: 'string',
            format: 'binary',
            description: 'JPG, PNG, or WEBP up to 2MB',
          },
        },
        required: ['name', 'description', 'category', 'price'],
      },
      BookFormPayload: {
        type: 'object',
        description:
          'multipart/form-data payload. title and description are JSON-encoded LocalizedText strings.',
        properties: {
          title: { type: 'string', description: 'JSON-encoded LocalizedText' },
          description: { type: 'string', description: 'JSON-encoded LocalizedText' },
          author: { type: 'string' },
          price: { type: 'integer', minimum: 0 },
          genre: { type: 'string', enum: [...BOOK_GENRES] },
          language: { type: 'string', enum: [...BOOK_LANGUAGES] },
          isAvailable: { type: 'string', enum: ['true', 'false'] },
          isFeatured: { type: 'string', enum: ['true', 'false'] },
          ...stockFormProps,
          coverImage: {
            type: 'string',
            format: 'binary',
            description: 'JPG, PNG, or WEBP up to 2MB',
          },
        },
        required: ['title', 'description', 'author', 'price', 'genre', 'language'],
      },
      OrderLine: {
        type: 'object',
        properties: {
          itemType: { type: 'string', enum: [...ITEM_TYPES] },
          itemId: { type: 'string', pattern: '^[a-fA-F\\d]{24}$' },
          quantity: { type: 'integer', minimum: 1, maximum: 20 },
        },
        required: ['itemType', 'itemId', 'quantity'],
      },
      OrderPayload: {
        type: 'object',
        description:
          'Prices and delivery are calculated on the server. A legacy `book` id (single copy) is also accepted instead of `items`.',
        properties: {
          items: {
            type: 'array',
            minItems: 1,
            maxItems: 20,
            items: { $ref: '#/components/schemas/OrderLine' },
          },
          customerName: { type: 'string' },
          customerPhone: { type: 'string' },
          customerAltPhone: { type: 'string' },
          customerEmail: { type: 'string', format: 'email' },
          addressLine: { type: 'string' },
          locality: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string', enum: [...INDIAN_STATES] },
          pincode: { type: 'string', pattern: '^\\d{6}$' },
          note: { type: 'string' },
        },
        required: [
          'items',
          'customerName',
          'customerPhone',
          'addressLine',
          'locality',
          'city',
          'state',
          'pincode',
        ],
      },
      QuotePayload: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderLine' } },
          state: { type: 'string', enum: [...INDIAN_STATES] },
        },
        required: ['items'],
      },
      OrderQuote: {
        type: 'object',
        properties: {
          lines: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                itemType: { type: 'string', enum: [...ITEM_TYPES] },
                itemId: { type: 'string' },
                title: { type: 'string' },
                subtitle: { type: 'string' },
                coverImageUrl: { type: 'string', nullable: true },
                unitPrice: { type: 'integer' },
                quantity: { type: 'integer' },
                lineTotal: { type: 'integer' },
                shippingClass: { type: 'string', enum: [...SHIPPING_CLASSES] },
                available: { type: 'integer', nullable: true },
                problem: { type: 'string', nullable: true },
              },
            },
          },
          subtotal: { type: 'integer' },
          deliveryCharge: { type: 'integer', nullable: true },
          freeDelivery: { type: 'boolean' },
          deliveryRegion: { type: 'string', enum: ['local', 'domestic'], nullable: true },
          deliveryEstimate: { type: 'string', nullable: true },
          freeDeliveryRemaining: { type: 'integer', nullable: true },
          total: { type: 'integer', nullable: true },
          canOrder: { type: 'boolean' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          itemType: { type: 'string', enum: [...ITEM_TYPES] },
          itemId: { type: 'string' },
          title: { type: 'string' },
          subtitle: { type: 'string' },
          unitPrice: { type: 'integer' },
          quantity: { type: 'integer' },
          lineTotal: { type: 'integer' },
          coverImageUrl: { type: 'string', nullable: true },
          shippingClass: { type: 'string', enum: [...SHIPPING_CLASSES] },
          stockDeducted: { type: 'boolean' },
        },
      },
      PublicOrder: {
        type: 'object',
        description: 'Returned after placing an order — used to build the WhatsApp message.',
        properties: {
          _id: { type: 'string' },
          orderNumber: { type: 'string', example: 'LL-1001' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          subtotal: { type: 'integer' },
          deliveryCharge: { type: 'integer' },
          total: { type: 'integer' },
          deliveryEstimate: { type: 'string' },
          status: { type: 'string', enum: [...ORDER_STATUSES] },
          paymentStatus: { type: 'string', enum: [...PAYMENT_STATUSES] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AdminOrder: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          orderNumber: { type: 'string' },
          channel: { type: 'string', enum: ['whatsapp'] },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          itemCount: { type: 'integer' },
          subtotal: { type: 'integer', minimum: 0 },
          deliveryCharge: { type: 'integer', minimum: 0 },
          total: { type: 'integer', minimum: 0 },
          deliveryRegion: { type: 'string', enum: ['local', 'domestic'] },
          deliveryEstimate: { type: 'string' },
          customerId: { type: 'string', nullable: true },
          customerName: { type: 'string' },
          customerPhone: { type: 'string' },
          customerAltPhone: { type: 'string', nullable: true },
          customerEmail: { type: 'string', nullable: true },
          addressLine: { type: 'string' },
          locality: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string', enum: [...INDIAN_STATES] },
          pincode: { type: 'string' },
          note: { type: 'string', nullable: true },
          status: { type: 'string', enum: [...ORDER_STATUSES] },
          statusHistory: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: [...ORDER_STATUSES] },
                at: { type: 'string', format: 'date-time' },
                byEmail: { type: 'string', nullable: true },
                note: { type: 'string', nullable: true },
              },
            },
          },
          paymentStatus: { type: 'string', enum: [...PAYMENT_STATUSES] },
          paymentMethod: { type: 'string', enum: [...PAYMENT_METHODS], nullable: true },
          paidAt: { type: 'string', format: 'date-time', nullable: true },
          stockPending: { type: 'boolean' },
          shipment: {
            type: 'object',
            properties: {
              courier: { type: 'string', nullable: true },
              trackingNumber: { type: 'string', nullable: true },
              trackingUrl: { type: 'string', nullable: true },
              shippedAt: { type: 'string', format: 'date-time', nullable: true },
              deliveredAt: { type: 'string', format: 'date-time', nullable: true },
            },
          },
          internalNotes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                byEmail: { type: 'string', nullable: true },
                at: { type: 'string', format: 'date-time' },
              },
            },
          },
          needsAttention: { type: 'boolean' },
          attentionReason: { type: 'string', nullable: true },
          receiptNumber: { type: 'string', nullable: true },
          receiptGeneratedAt: { type: 'string', format: 'date-time', nullable: true },
          isLegacy: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AdminOrderPage: {
        type: 'object',
        properties: {
          orders: { type: 'array', items: { $ref: '#/components/schemas/AdminOrder' } },
          total: { type: 'integer' },
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
        },
      },
      OrderStatusUpdate: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: [...ORDER_STATUSES] },
          courier: { type: 'string', description: 'Required when status is "shipped"' },
          trackingNumber: { type: 'string' },
          trackingUrl: { type: 'string', format: 'uri' },
          note: { type: 'string' },
        },
        required: ['status'],
      },
      PaymentUpdate: {
        type: 'object',
        properties: {
          paymentStatus: { type: 'string', enum: [...PAYMENT_STATUSES] },
          method: {
            type: 'string',
            enum: [...PAYMENT_METHODS],
            description: 'Required when paymentStatus is "paid"',
          },
          note: { type: 'string' },
        },
        required: ['paymentStatus'],
      },
      DeliveryChargeUpdate: {
        type: 'object',
        properties: { deliveryCharge: { type: 'integer', minimum: 0 } },
        required: ['deliveryCharge'],
      },
      OrderNote: {
        type: 'object',
        properties: { text: { type: 'string', maxLength: 1000 } },
        required: ['text'],
      },
      ResolveAttention: {
        type: 'object',
        properties: {
          skipStock: {
            type: 'boolean',
            description: 'Clear the flag without taking the missing stock',
          },
          note: { type: 'string' },
        },
      },
      InventoryItem: {
        type: 'object',
        properties: {
          itemType: { type: 'string', enum: [...ITEM_TYPES] },
          _id: { type: 'string' },
          title: { type: 'string' },
          subtitle: { type: 'string' },
          price: { type: 'integer' },
          coverImageUrl: { type: 'string', nullable: true },
          isAvailable: { type: 'boolean' },
          stock: { type: 'integer', nullable: true },
          lowStockThreshold: { type: 'integer', nullable: true },
          effectiveLowStockThreshold: { type: 'integer' },
          stockStatus: { type: 'string', enum: [...STOCK_STATUSES] },
        },
      },
      StockAdjustment: {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: ['add', 'remove', 'set', 'untrack'] },
          quantity: { type: 'integer', description: 'Not used with "untrack"' },
          reason: { type: 'string', enum: [...MANUAL_STOCK_REASONS] },
          note: { type: 'string' },
        },
        required: ['mode'],
      },
      StockMovement: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          delta: { type: 'integer' },
          stockAfter: { type: 'integer', nullable: true },
          reason: { type: 'string', enum: [...STOCK_REASONS] },
          note: { type: 'string', nullable: true },
          orderId: { type: 'string', nullable: true },
          orderNumber: { type: 'string', nullable: true },
          byEmail: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      DeliveryRegion: {
        type: 'object',
        properties: {
          rates: {
            type: 'object',
            properties: {
              light: { type: 'integer', minimum: 0 },
              standard: { type: 'integer', minimum: 0 },
              heavy: { type: 'integer', minimum: 0 },
            },
          },
          itemsIncluded: { type: 'integer', minimum: 1 },
          extraItemCharge: { type: 'integer', minimum: 0 },
          estimate: { type: 'string' },
        },
      },
      StoreSettings: {
        type: 'object',
        properties: {
          store: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string', nullable: true },
            },
          },
          notificationEmail: { type: 'string', nullable: true },
          delivery: {
            type: 'object',
            properties: {
              localStates: { type: 'array', items: { type: 'string', enum: [...INDIAN_STATES] } },
              local: { $ref: '#/components/schemas/DeliveryRegion' },
              domestic: { $ref: '#/components/schemas/DeliveryRegion' },
              freeDeliveryThreshold: { type: 'integer', nullable: true },
              processingTime: { type: 'string' },
            },
          },
          inventory: {
            type: 'object',
            properties: { defaultLowStockThreshold: { type: 'integer', minimum: 0 } },
          },
        },
      },
      PublicSettings: {
        type: 'object',
        properties: {
          storeName: { type: 'string' },
          freeDeliveryThreshold: { type: 'integer', nullable: true },
          processingTime: { type: 'string' },
          localStates: { type: 'array', items: { type: 'string' } },
          estimates: {
            type: 'object',
            properties: { local: { type: 'string' }, domestic: { type: 'string' } },
          },
        },
      },
      CustomerAddress: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          label: { type: 'string' },
          name: { type: 'string' },
          phone: { type: 'string' },
          altPhone: { type: 'string' },
          addressLine: { type: 'string' },
          locality: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string', enum: [...INDIAN_STATES] },
          pincode: { type: 'string', pattern: '^\\d{6}$' },
          isDefault: { type: 'boolean' },
        },
        required: ['name', 'phone', 'addressLine', 'locality', 'city', 'state', 'pincode'],
      },
      Customer: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          phone: { type: 'string' },
          emailVerified: { type: 'boolean' },
          addresses: { type: 'array', items: { $ref: '#/components/schemas/CustomerAddress' } },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CustomerSession: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'Customer bearer token (30 days)' },
          customer: { $ref: '#/components/schemas/Customer' },
        },
      },
      CustomerOrder: {
        type: 'object',
        description: "A customer's own order — no internal notes or stock details.",
        properties: {
          _id: { type: 'string' },
          orderNumber: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          subtotal: { type: 'integer' },
          deliveryCharge: { type: 'integer' },
          total: { type: 'integer' },
          status: { type: 'string', enum: [...ORDER_STATUSES] },
          timeline: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: [...ORDER_STATUSES] },
                at: { type: 'string', format: 'date-time' },
              },
            },
          },
          paymentStatus: { type: 'string', enum: [...PAYMENT_STATUSES] },
          receiptAvailable: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Dashboard: {
        type: 'object',
        properties: {
          orders: {
            type: 'object',
            properties: {
              toShip: { type: 'integer' },
              needsAttention: { type: 'integer' },
              unpaid: { type: 'integer' },
              placedToday: { type: 'integer' },
            },
          },
          revenue: {
            type: 'object',
            properties: { today: { type: 'integer' }, thisMonth: { type: 'integer' } },
          },
          stock: {
            type: 'object',
            properties: { lowStock: { type: 'integer' }, outOfStock: { type: 'integer' } },
          },
        },
      },
    },
  },
  paths: {
    '/books': {
      get: {
        tags: ['Books'],
        summary: 'List books in the public catalogue',
        parameters: [
          langQueryParam,
          {
            name: 'genre',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: [...BOOK_GENRES] },
          },
          {
            name: 'language',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: [...BOOK_LANGUAGES] },
          },
          {
            name: 'available',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['true', 'false'] },
          },
          {
            name: 'featured',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['true', 'false'] },
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string', minLength: 1, maxLength: 100 },
            description: 'Case-insensitive title search (English and Urdu titles)',
          },
        ],
        responses: {
          200: {
            description: 'Matching books',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/PublicBook' } },
              },
            },
          },
          400: errorResponse('Validation failed'),
        },
      },
    },
    '/books/{id}': {
      get: {
        tags: ['Books'],
        summary: 'Get a single book',
        parameters: [bookIdParam, langQueryParam],
        responses: {
          200: {
            description: 'The book',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PublicBook' } },
            },
          },
          400: errorResponse('Validation failed'),
          404: errorResponse('Book not found'),
        },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products in the public catalogue',
        parameters: [
          langQueryParam,
          {
            name: 'category',
            in: 'query',
            required: false,
            schema: { type: 'string', maxLength: 60 },
            description: 'Category slug. Unknown or inactive categories return an empty list.',
          },
          {
            name: 'available',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['true', 'false'] },
          },
          {
            name: 'featured',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['true', 'false'] },
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string', minLength: 1, maxLength: 100 },
            description: 'Case-insensitive name search (English and Urdu names)',
          },
        ],
        responses: {
          200: {
            description: 'Matching products',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/PublicProduct' } },
              },
            },
          },
          400: errorResponse('Validation failed'),
        },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a single product',
        parameters: [productIdParam, langQueryParam],
        responses: {
          200: {
            description: 'The product',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PublicProduct' } },
            },
          },
          400: errorResponse('Validation failed'),
          404: errorResponse('Product not found'),
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List active categories for storefront navigation',
        parameters: [langQueryParam],
        responses: {
          200: {
            description: 'Active categories',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/PublicCategory' } },
              },
            },
          },
          400: errorResponse('Validation failed'),
        },
      },
    },
    '/categories/{slug}': {
      get: {
        tags: ['Categories'],
        summary: 'Get a single active category by slug',
        parameters: [categorySlugParam, langQueryParam],
        responses: {
          200: {
            description: 'The category',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PublicCategory' } },
            },
          },
          400: errorResponse('Validation failed'),
          404: errorResponse('Category not found (or inactive)'),
        },
      },
    },
    '/instagram': {
      get: {
        tags: ['Instagram'],
        summary: 'List the most recent Instagram posts for the homepage feed',
        description:
          'Cached server-side for 30 minutes. Returns an empty list when no token is configured or Instagram is unreachable with nothing cached.',
        responses: {
          200: {
            description: 'Up to 8 recent posts, newest first',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    posts: { type: 'array', items: { $ref: '#/components/schemas/InstagramPost' } },
                  },
                  required: ['posts'],
                },
              },
            },
          },
        },
      },
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Place an order (completed over WhatsApp)',
        description: 'Rate limited to 10 orders per 15 minutes per connection.',
        requestBody: jsonBody('OrderPayload'),
        responses: {
          201: jsonResponse('Order placed', 'PublicOrder'),
          400: errorResponse('Validation failed, or an item no longer exists / is hidden'),
          409: errorResponse('An item is out of stock or not available in that quantity'),
          429: errorResponse('Too many orders'),
        },
      },
    },
    '/orders/quote': {
      post: {
        tags: ['Orders'],
        summary: 'Price a cart (subtotal, delivery, problems per line)',
        requestBody: jsonBody('QuotePayload'),
        responses: {
          200: jsonResponse('Quote', 'OrderQuote'),
          400: errorResponse('Validation failed'),
        },
      },
    },
    '/settings': {
      get: {
        tags: ['Orders'],
        summary: 'Public delivery information (free-delivery threshold, estimates)',
        responses: { 200: jsonResponse('Public settings', 'PublicSettings') },
      },
    },
    '/admin/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in as an admin',
        description:
          'Rate limited to 5 failed attempts per 15 minutes. If mustChangePassword is true, the frontend should redirect to the change-password page before allowing further use.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } },
            },
          },
          400: errorResponse('Validation failed'),
          401: errorResponse('Invalid credentials'),
          429: errorResponse('Too many login attempts'),
        },
      },
    },
    '/admin/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: "Change the authenticated admin's own password",
        description:
          'Invalidates every existing session for this admin, including the one making the request. The response carries a fresh token that replaces it.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
                required: ['currentPassword', 'newPassword'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password changed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    token: {
                      type: 'string',
                      description: 'Replacement JWT; the one used for this request is now invalid',
                    },
                  },
                  required: ['message', 'token'],
                },
              },
            },
          },
          400: errorResponse('Validation failed, or new password same as current password'),
          401: errorResponse('Missing/invalid token, or current password is incorrect'),
        },
      },
    },
    '/admin/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset link',
        description:
          'Always returns the same generic success response, whether or not the email belongs to an account, to avoid leaking account existence. Rate limited to 5 requests per 15 minutes.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { email: { type: 'string', format: 'email' } },
                required: ['email'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Generic confirmation (does not indicate whether the account exists)',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } },
            },
          },
          400: errorResponse('Validation failed'),
          429: errorResponse('Too many password reset requests'),
        },
      },
    },
    '/admin/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset a password using a token from the forgot-password email',
        description: 'The token is valid for 30 minutes and single-use.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string', description: 'Raw token from the reset link' },
                  newPassword: { type: 'string', minLength: 8 },
                },
                required: ['token', 'newPassword'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } },
            },
          },
          400: errorResponse('Validation failed'),
          401: errorResponse('Reset link is invalid or has expired'),
          429: errorResponse('Too many attempts'),
        },
      },
    },
    '/admin/books': {
      get: {
        tags: ['Admin Books'],
        summary: 'List all books with full localized fields',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'All books',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/AdminBook' } },
              },
            },
          },
          401: errorResponse('Missing or invalid token'),
        },
      },
      post: {
        tags: ['Admin Books'],
        summary: 'Create a book',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': { schema: { $ref: '#/components/schemas/BookFormPayload' } },
          },
        },
        responses: {
          201: {
            description: 'Created book',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AdminBook' } },
            },
          },
          400: errorResponse('Validation failed'),
          401: errorResponse('Missing or invalid token'),
        },
      },
    },
    '/admin/books/{id}': {
      put: {
        tags: ['Admin Books'],
        summary: 'Update a book',
        security: [{ bearerAuth: [] }],
        parameters: [bookIdParam],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': { schema: { $ref: '#/components/schemas/BookFormPayload' } },
          },
        },
        responses: {
          200: {
            description: 'Updated book',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AdminBook' } },
            },
          },
          400: errorResponse('Validation failed'),
          401: errorResponse('Missing or invalid token'),
          404: errorResponse('Book not found'),
        },
      },
      delete: {
        tags: ['Admin Books'],
        summary: 'Delete a book (and its stored cover image)',
        security: [{ bearerAuth: [] }],
        parameters: [bookIdParam],
        responses: {
          200: {
            description: 'Deletion confirmation',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { message: { type: 'string' } } },
              },
            },
          },
          401: errorResponse('Missing or invalid token'),
          404: errorResponse('Book not found'),
        },
      },
    },
    '/admin/books/{id}/availability': {
      patch: {
        tags: ['Admin Books'],
        summary: 'Toggle a book’s availability',
        security: [{ bearerAuth: [] }],
        parameters: [bookIdParam],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { isAvailable: { type: 'boolean' } },
                required: ['isAvailable'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated book',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AdminBook' } },
            },
          },
          400: errorResponse('Validation failed'),
          401: errorResponse('Missing or invalid token'),
          404: errorResponse('Book not found'),
        },
      },
    },
    '/admin/books/{id}/featured': {
      patch: {
        tags: ['Admin Books'],
        summary: 'Toggle whether a book is featured on the homepage',
        security: [{ bearerAuth: [] }],
        parameters: [bookIdParam],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { isFeatured: { type: 'boolean' } },
                required: ['isFeatured'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated book',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AdminBook' } },
            },
          },
          400: errorResponse('Validation failed'),
          401: errorResponse('Missing or invalid token'),
          404: errorResponse('Book not found'),
        },
      },
    },
    '/admin/products': {
      get: {
        tags: ['Admin Products'],
        summary: 'List all products with full localized fields',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'All products',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/AdminProduct' } },
              },
            },
          },
          401: errorResponse('Missing or invalid token'),
        },
      },
      post: {
        tags: ['Admin Products'],
        summary: 'Create a product (category must exist and be active)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/ProductFormPayload' },
            },
          },
        },
        responses: {
          201: {
            description: 'Created product',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AdminProduct' } },
            },
          },
          400: errorResponse('Validation failed / category missing or inactive'),
          401: errorResponse('Missing or invalid token'),
        },
      },
    },
    '/admin/products/{id}': {
      put: {
        tags: ['Admin Products'],
        summary: 'Update a product (category must exist and be active)',
        security: [{ bearerAuth: [] }],
        parameters: [productIdParam],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/ProductFormPayload' },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated product',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AdminProduct' } },
            },
          },
          400: errorResponse('Validation failed / category missing or inactive'),
          401: errorResponse('Missing or invalid token'),
          404: errorResponse('Product not found'),
        },
      },
      delete: {
        tags: ['Admin Products'],
        summary: 'Delete a product (and its stored cover image)',
        security: [{ bearerAuth: [] }],
        parameters: [productIdParam],
        responses: {
          200: {
            description: 'Deletion confirmation',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { message: { type: 'string' } } },
              },
            },
          },
          401: errorResponse('Missing or invalid token'),
          404: errorResponse('Product not found'),
        },
      },
    },
    '/admin/products/{id}/availability': {
      patch: {
        tags: ['Admin Products'],
        summary: 'Toggle a product’s availability',
        security: [{ bearerAuth: [] }],
        parameters: [productIdParam],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { isAvailable: { type: 'boolean' } },
                required: ['isAvailable'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated product',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AdminProduct' } },
            },
          },
          400: errorResponse('Validation failed'),
          401: errorResponse('Missing or invalid token'),
          404: errorResponse('Product not found'),
        },
      },
    },
    '/admin/products/{id}/featured': {
      patch: {
        tags: ['Admin Products'],
        summary: 'Toggle whether a product is featured on the homepage',
        security: [{ bearerAuth: [] }],
        parameters: [productIdParam],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { isFeatured: { type: 'boolean' } },
                required: ['isFeatured'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated product',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AdminProduct' } },
            },
          },
          400: errorResponse('Validation failed'),
          401: errorResponse('Missing or invalid token'),
          404: errorResponse('Product not found'),
        },
      },
    },
    '/admin/categories': {
      get: {
        tags: ['Admin Categories'],
        summary: 'List all categories, including inactive (any admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'All categories',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/AdminCategory' } },
              },
            },
          },
          401: errorResponse('Missing or invalid token'),
        },
      },
      post: {
        tags: ['Admin Categories'],
        summary: 'Create a category (super admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': { schema: { $ref: '#/components/schemas/CategoryFormPayload' } },
          },
        },
        responses: {
          201: {
            description: 'Created category',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AdminCategory' } },
            },
          },
          400: errorResponse('Validation failed'),
          401: errorResponse('Missing or invalid token'),
          403: errorResponse('Super admin access required'),
          409: errorResponse('A category with this slug already exists'),
        },
      },
    },
    '/admin/categories/{id}': {
      put: {
        tags: ['Admin Categories'],
        summary: 'Update a category (super admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [categoryIdParam],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': { schema: { $ref: '#/components/schemas/CategoryFormPayload' } },
          },
        },
        responses: {
          200: {
            description: 'Updated category',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AdminCategory' } },
            },
          },
          400: errorResponse('Validation failed'),
          401: errorResponse('Missing or invalid token'),
          403: errorResponse('Super admin access required'),
          404: errorResponse('Category not found'),
          409: errorResponse('A category with this slug already exists'),
        },
      },
      delete: {
        tags: ['Admin Categories'],
        summary: 'Delete a category with no products assigned (super admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [categoryIdParam],
        responses: {
          200: {
            description: 'Deletion confirmation',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { message: { type: 'string' } } },
              },
            },
          },
          401: errorResponse('Missing or invalid token'),
          403: errorResponse('Super admin access required'),
          404: errorResponse('Category not found'),
          409: errorResponse('This category still has products assigned'),
        },
      },
    },
    '/admin/admins': {
      get: {
        tags: ['Admins'],
        summary: 'List admin accounts',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'All admin accounts',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Admin' } },
              },
            },
          },
          401: errorResponse('Missing or invalid token'),
          403: errorResponse('Super admin access required'),
        },
      },
      post: {
        tags: ['Admins'],
        summary: 'Create an admin account',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  role: { type: 'string', enum: [...ADMIN_ROLES] },
                },
                required: ['email', 'password', 'role'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Created admin',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Admin' } } },
          },
          400: errorResponse('Validation failed'),
          401: errorResponse('Missing or invalid token'),
          403: errorResponse('Super admin access required'),
          409: errorResponse('An admin with this email already exists'),
        },
      },
    },
    '/admin/admins/{id}': {
      delete: {
        tags: ['Admins'],
        summary: 'Delete an admin account (cannot delete yourself)',
        security: [{ bearerAuth: [] }],
        parameters: [adminIdParam],
        responses: {
          200: {
            description: 'Deletion confirmation',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { message: { type: 'string' } } },
              },
            },
          },
          400: errorResponse('Cannot act on your own account'),
          401: errorResponse('Missing or invalid token'),
          403: errorResponse('Super admin access required'),
          404: errorResponse('Admin not found'),
        },
      },
    },
    '/admin/admins/{id}/deactivate': {
      patch: {
        tags: ['Admins'],
        summary: 'Deactivate an admin (revokes their tokens)',
        security: [{ bearerAuth: [] }],
        parameters: [adminIdParam],
        responses: {
          200: {
            description: 'Updated admin',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Admin' } } },
          },
          400: errorResponse('Cannot act on your own account'),
          401: errorResponse('Missing or invalid token'),
          403: errorResponse('Super admin access required'),
          404: errorResponse('Admin not found'),
        },
      },
    },
    '/admin/admins/{id}/reactivate': {
      patch: {
        tags: ['Admins'],
        summary: 'Reactivate a deactivated admin',
        security: [{ bearerAuth: [] }],
        parameters: [adminIdParam],
        responses: {
          200: {
            description: 'Updated admin',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Admin' } } },
          },
          401: errorResponse('Missing or invalid token'),
          403: errorResponse('Super admin access required'),
          404: errorResponse('Admin not found'),
        },
      },
    },
    '/admin/admins/{id}/role': {
      patch: {
        tags: ['Admins'],
        summary: 'Change an admin’s role (cannot change your own)',
        security: [{ bearerAuth: [] }],
        parameters: [adminIdParam],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { role: { type: 'string', enum: [...ADMIN_ROLES] } },
                required: ['role'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated admin',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Admin' } } },
          },
          400: errorResponse('Validation failed / cannot change own role'),
          401: errorResponse('Missing or invalid token'),
          403: errorResponse('Super admin access required'),
          404: errorResponse('Admin not found'),
        },
      },
    },
    '/admin/admins/{id}/force-password-reset': {
      patch: {
        tags: ['Admins'],
        summary: "Force-reset another admin's password (cannot target yourself)",
        description:
          'Generates a new temporary password, hashes and stores it, and sets mustChangePassword so the admin must change it on next login. Also invalidates any sessions the admin currently holds. The plaintext temporary password is returned once in this response and is never stored or retrievable again.',
        security: [{ bearerAuth: [] }],
        parameters: [adminIdParam],
        responses: {
          200: {
            description: 'One-time temporary password for the target admin',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { temporaryPassword: { type: 'string' } },
                  required: ['temporaryPassword'],
                },
              },
            },
          },
          400: errorResponse('Cannot act on your own account'),
          401: errorResponse('Missing or invalid token'),
          403: errorResponse('Super admin access required'),
          404: errorResponse('Admin not found'),
        },
      },
    },
    '/admin/orders': {
      get: {
        tags: ['Admin Orders'],
        summary: 'List orders (paginated)',
        security: bearer,
        parameters: [
          {
            name: 'view',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: [...ORDER_VIEWS], default: 'all' },
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Matches order number, customer name/phone, or item title',
          },
          {
            name: 'sort',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['newest', 'oldest'], default: 'newest' },
          },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 25, maximum: 100 },
          },
        ],
        responses: {
          200: jsonResponse('A page of orders', 'AdminOrderPage'),
          401: errorResponse('Missing or invalid token'),
        },
      },
    },
    '/admin/orders/counts': {
      get: {
        tags: ['Admin Orders'],
        summary: 'Number of orders in each view (for tab badges)',
        security: bearer,
        responses: {
          200: {
            description: 'Counts keyed by view',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: { type: 'integer' } },
              },
            },
          },
        },
      },
    },
    '/admin/orders/{id}': {
      get: {
        tags: ['Admin Orders'],
        summary: 'Get one order',
        security: bearer,
        parameters: [orderIdParam],
        responses: {
          200: jsonResponse('Order', 'AdminOrder'),
          404: errorResponse('Order not found'),
        },
      },
    },
    '/admin/orders/{id}/status': {
      patch: adminOrderAction(
        'Move an order along (packed, shipped, delivered, returned, cancelled)',
        'OrderStatusUpdate',
        'Transition not allowed, unpaid order shipped, or courier missing'
      ),
    },
    '/admin/orders/{id}/payment': {
      patch: adminOrderAction(
        'Record, revert, or refund a payment (takes / returns stock)',
        'PaymentUpdate',
        'Payment change not allowed in the current state'
      ),
    },
    '/admin/orders/{id}/delivery-charge': {
      patch: adminOrderAction(
        'Override the delivery charge (before payment only)',
        'DeliveryChargeUpdate',
        'Order already paid or cancelled'
      ),
    },
    '/admin/orders/{id}/notes': {
      post: adminOrderAction('Add an internal note', 'OrderNote', 'Validation failed'),
    },
    '/admin/orders/{id}/resolve': {
      post: adminOrderAction(
        'Clear "needs attention", taking any stock still owed',
        'ResolveAttention',
        'Validation failed'
      ),
    },
    '/admin/orders/{id}/receipt': {
      get: {
        tags: ['Admin Orders'],
        summary: 'Download the receipt PDF for a paid order',
        description:
          'Issues a receipt number (LL/<financial year>/0001…) on first request; later requests reuse it.',
        security: bearer,
        parameters: [orderIdParam],
        responses: {
          200: {
            description: 'Receipt PDF',
            content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
          },
          400: errorResponse('Payment not recorded yet'),
          401: errorResponse('Missing or invalid token'),
          404: errorResponse('Order not found'),
        },
      },
    },
    '/admin/inventory': {
      get: {
        tags: ['Admin Inventory'],
        summary: 'List books and products with their stock',
        security: bearer,
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['all', 'low', 'out', 'attention', 'untracked'],
              default: 'all',
            },
          },
          {
            name: 'itemType',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: [...ITEM_TYPES] },
          },
          { name: 'search', in: 'query', required: false, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Items',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/InventoryItem' } },
              },
            },
          },
        },
      },
    },
    '/admin/inventory/{itemType}/{id}/adjustments': {
      post: {
        tags: ['Admin Inventory'],
        summary: 'Add, remove, set, or stop tracking stock',
        security: bearer,
        parameters: itemParams,
        requestBody: jsonBody('StockAdjustment'),
        responses: {
          200: jsonResponse('Updated item', 'InventoryItem'),
          400: errorResponse('Validation failed'),
          404: errorResponse('Item not found'),
          409: errorResponse('Not enough stock to remove, or stock not tracked'),
        },
      },
    },
    '/admin/inventory/{itemType}/{id}/movements': {
      get: {
        tags: ['Admin Inventory'],
        summary: 'Stock history for an item (newest first, last 200)',
        security: bearer,
        parameters: itemParams,
        responses: {
          200: {
            description: 'Movements',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/StockMovement' } },
              },
            },
          },
        },
      },
    },
    '/admin/settings': {
      get: {
        tags: ['Admin Settings'],
        summary: 'Store, delivery, and inventory settings',
        security: bearer,
        responses: { 200: jsonResponse('Settings', 'StoreSettings') },
      },
      put: {
        tags: ['Admin Settings'],
        summary: 'Save settings (super admin only)',
        security: bearer,
        requestBody: jsonBody('StoreSettings'),
        responses: {
          200: jsonResponse('Saved settings', 'StoreSettings'),
          400: errorResponse('Validation failed'),
          403: errorResponse('Super admin access required'),
        },
      },
    },
    '/customer/register': {
      post: {
        tags: ['Customer Account'],
        summary: 'Create an account (sends a verification email)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                  phone: { type: 'string' },
                },
                required: ['email', 'password', 'name'],
              },
            },
          },
        },
        responses: {
          201: jsonResponse('Signed in', 'CustomerSession'),
          409: errorResponse('Email already registered'),
        },
      },
    },
    '/customer/login': {
      post: {
        tags: ['Customer Account'],
        summary: 'Sign in',
        responses: {
          200: jsonResponse('Signed in', 'CustomerSession'),
          401: errorResponse('Incorrect email or password'),
        },
      },
    },
    '/customer/verify-email': {
      post: {
        tags: ['Customer Account'],
        summary: 'Confirm the email (links earlier guest orders placed with it)',
        responses: {
          200: jsonResponse('Verified', 'Customer'),
          401: errorResponse('Invalid or expired link'),
        },
      },
    },
    '/customer/forgot-password': {
      post: {
        tags: ['Customer Account'],
        summary: 'Email a reset link (same answer for unknown emails)',
        responses: { 200: { description: 'Accepted' } },
      },
    },
    '/customer/reset-password': {
      post: {
        tags: ['Customer Account'],
        summary: 'Set a new password from a reset link; signs out other devices',
        responses: {
          200: { description: 'Updated' },
          401: errorResponse('Invalid or expired link'),
        },
      },
    },
    '/customer/me': {
      get: {
        tags: ['Customer Account'],
        summary: 'Current customer',
        security: bearer,
        responses: {
          200: jsonResponse('Customer', 'Customer'),
          401: errorResponse('Not signed in'),
        },
      },
      patch: {
        tags: ['Customer Account'],
        summary: 'Update name and phone',
        security: bearer,
        responses: { 200: jsonResponse('Customer', 'Customer') },
      },
    },
    '/customer/resend-verification': {
      post: {
        tags: ['Customer Account'],
        summary: 'Send the verification email again',
        security: bearer,
        responses: { 200: { description: 'Sent' } },
      },
    },
    '/customer/change-password': {
      post: {
        tags: ['Customer Account'],
        summary: 'Change password; returns a fresh session and signs out other devices',
        security: bearer,
        responses: { 200: jsonResponse('Signed in', 'CustomerSession') },
      },
    },
    '/customer/addresses': {
      post: {
        tags: ['Customer Account'],
        summary: 'Save an address (max 10; the first becomes the default)',
        security: bearer,
        requestBody: jsonBody('CustomerAddress'),
        responses: { 201: jsonResponse('Customer', 'Customer') },
      },
    },
    '/customer/addresses/{addressId}': {
      put: {
        tags: ['Customer Account'],
        summary: 'Edit a saved address',
        security: bearer,
        requestBody: jsonBody('CustomerAddress'),
        responses: { 200: jsonResponse('Customer', 'Customer') },
      },
      delete: {
        tags: ['Customer Account'],
        summary: 'Delete a saved address',
        security: bearer,
        responses: { 200: jsonResponse('Customer', 'Customer') },
      },
    },
    '/customer/orders': {
      get: {
        tags: ['Customer Account'],
        summary: "The signed-in customer's orders",
        security: bearer,
        responses: { 200: { description: '{ orders: CustomerOrder[], total, page, pageSize }' } },
      },
    },
    '/customer/orders/{id}': {
      get: {
        tags: ['Customer Account'],
        summary: 'One of their orders',
        security: bearer,
        responses: {
          200: jsonResponse('Order', 'CustomerOrder'),
          404: errorResponse('Not found (or not theirs)'),
        },
      },
    },
    '/customer/orders/{id}/receipt': {
      get: {
        tags: ['Customer Account'],
        summary: 'Download the receipt PDF (paid orders only)',
        security: bearer,
        responses: {
          200: { description: 'Receipt PDF' },
          400: errorResponse('Not paid yet'),
        },
      },
    },
    '/admin/customers': {
      get: {
        tags: ['Admin Customers'],
        summary: 'List customers with order count and total spent',
        security: bearer,
        responses: { 200: { description: '{ customers, total, page, pageSize }' } },
      },
    },
    '/admin/customers/{id}': {
      get: {
        tags: ['Admin Customers'],
        summary: 'One customer with addresses and recent orders',
        security: bearer,
        responses: {
          200: { description: 'Customer with orders' },
          404: errorResponse('Not found'),
        },
      },
    },
    '/admin/dashboard': {
      get: {
        tags: ['Admin Dashboard'],
        summary: 'Orders to ship, revenue, and stock alerts',
        security: bearer,
        responses: { 200: jsonResponse('Dashboard', 'Dashboard') },
      },
    },
  },
} as const;

export default openApiDocument;
