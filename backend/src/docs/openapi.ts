import { ADMIN_ROLES } from '../modules/admins/admin.constants.js';
import {
  BOOK_GENRES,
  BOOK_LANGUAGES,
  TRANSLATION_LANGUAGES,
} from '../modules/books/book.constants.js';

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
    { name: 'Auth', description: 'Admin authentication' },
    { name: 'Admin Books', description: 'Book management (admin token required)' },
    { name: 'Admin Products', description: 'Product management (admin token required)' },
    {
      name: 'Admin Categories',
      description:
        'Category taxonomy. Any admin can list; create/update/delete require a super admin token.',
    },
    { name: 'Admins', description: 'Admin account management (super admin token required)' },
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
          price: { type: 'number', minimum: 0 },
          genre: { type: 'string', enum: [...BOOK_GENRES] },
          language: { type: 'string', enum: [...BOOK_LANGUAGES] },
          coverImage: { $ref: '#/components/schemas/CoverImage' },
          isAvailable: { type: 'boolean' },
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
          price: { type: 'number', minimum: 0 },
          genre: { type: 'string', enum: [...BOOK_GENRES] },
          language: { type: 'string', enum: [...BOOK_LANGUAGES] },
          coverImage: { $ref: '#/components/schemas/CoverImage' },
          isAvailable: { type: 'boolean' },
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
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
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
        },
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
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CategoryPayload: {
        type: 'object',
        properties: {
          name: { $ref: '#/components/schemas/LocalizedText' },
          slug: {
            type: 'string',
            pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
            maxLength: 60,
            description: 'Stable machine-safe identifier used for filtering',
          },
          tagline: { $ref: '#/components/schemas/LocalizedText' },
          isActive: { type: 'boolean' },
        },
        required: ['name', 'slug'],
      },
      PublicProduct: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', description: 'Localized to the requested lang' },
          description: { type: 'string', description: 'Localized to the requested lang' },
          price: { type: 'number', minimum: 0 },
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
          price: { type: 'number', minimum: 0 },
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
          price: { type: 'number', minimum: 0 },
          isAvailable: { type: 'string', enum: ['true', 'false'] },
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
          price: { type: 'number', minimum: 0 },
          genre: { type: 'string', enum: [...BOOK_GENRES] },
          language: { type: 'string', enum: [...BOOK_LANGUAGES] },
          isAvailable: { type: 'string', enum: ['true', 'false'] },
          coverImage: {
            type: 'string',
            format: 'binary',
            description: 'JPG, PNG, or WEBP up to 2MB',
          },
        },
        required: ['title', 'description', 'author', 'price', 'genre', 'language'],
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
    '/admin/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in as an admin',
        description: 'Rate limited to 5 failed attempts per 15 minutes.',
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
            description: 'JWT valid for 24 hours',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { token: { type: 'string' } },
                  required: ['token'],
                },
              },
            },
          },
          400: errorResponse('Validation failed'),
          401: errorResponse('Invalid credentials'),
          429: errorResponse('Too many login attempts'),
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
            'application/json': { schema: { $ref: '#/components/schemas/CategoryPayload' } },
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
            'application/json': { schema: { $ref: '#/components/schemas/CategoryPayload' } },
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
  },
} as const;

export default openApiDocument;
