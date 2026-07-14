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
    { name: 'Auth', description: 'Admin authentication' },
    { name: 'Admin Books', description: 'Book management (admin token required)' },
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
