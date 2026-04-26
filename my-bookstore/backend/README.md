# Backend Architecture

This backend powers the catalog and admin APIs for `my-bookstore`.

The project started as a compact Express + Mongoose app with routes talking directly to the `Book` model. That worked well for an MVP, but it would become harder to maintain as the codebase grew. We refactored it into a layered structure so responsibilities are clearer, code is easier to test, and new features can be added without turning route files into a dumping ground.

## What Changed

The backend now uses a `src/`-based structure with separation between:

- app wiring
- runtime configuration
- shared middleware and error handling
- feature modules
- database access
- business logic

We kept the existing API paths working:

- `/api/books`
- `/api/admin/auth`
- `/api/admin/books`

We also added versioned aliases for future compatibility:

- `/api/v1/books`
- `/api/v1/admin/auth`
- `/api/v1/admin/books`

The old root-level `server.js` and `seed.js` now act as compatibility shims and simply forward into the new `src/` implementation.

## Directory Structure

```text
backend/
  package.json
  server.js
  seed.js
  .env.example
  README.md

  src/
    app.js
    server.js

    config/
      cors.js
      db.js
      env.js

    common/
      errors/
        AppError.js
        NotFoundError.js
        UnauthorizedError.js
        ValidationError.js
      middleware/
        authenticateAdmin.js
        errorHandler.js
        notFound.js
        validate.js
      utils/
        asyncHandler.js
        logger.js

    modules/
      admin-auth/
        auth.controller.js
        auth.routes.js
        auth.service.js
        auth.validators.js
      books/
        book.constants.js
        book.controller.js
        book.mapper.js
        book.model.js
        book.repository.js
        book.routes.js
        book.service.js
        book.validators.js

    scripts/
      seed.js
```

## Layer Responsibilities

### `src/app.js`

Owns Express app composition:

- CORS
- JSON body parsing
- route mounting
- `/health` endpoint
- 404 handling
- global error handling

This file should not contain business logic or database connection code.

### `src/server.js`

Owns process startup and shutdown:

- connect to MongoDB
- start the HTTP server
- handle `SIGINT` and `SIGTERM`
- disconnect cleanly on shutdown

This split makes the app easier to test and easier to reason about operationally.

### `src/config/`

Holds runtime configuration concerns:

- `env.js`: validates required environment variables and exposes normalized config
- `db.js`: MongoDB connect/disconnect helpers
- `cors.js`: builds CORS settings from environment config

This prevents `process.env` access from being scattered all over the codebase.

### `src/common/`

Contains shared technical building blocks that are not specific to books or auth.

#### `errors/`

Custom application error types used for predictable API behavior:

- `AppError`
- `NotFoundError`
- `UnauthorizedError`
- `ValidationError`

#### `middleware/`

Reusable Express middleware:

- `authenticateAdmin.js`: JWT admin guard
- `validate.js`: runs `express-validator` rules and converts failures to structured errors
- `errorHandler.js`: central error-to-response mapping
- `notFound.js`: consistent 404 fallback

#### `utils/`

Shared helpers:

- `asyncHandler.js`: keeps async route handlers from needing repeated `try/catch`
- `logger.js`: minimal logging abstraction for easier future upgrade to a structured logger

### `src/modules/`

Feature modules group everything related to one business area in one place.

This is the main architectural improvement in the refactor.

#### `modules/books/`

Contains the full books feature:

- `book.model.js`: Mongoose schema and indexes
- `book.repository.js`: raw database access
- `book.service.js`: business rules and orchestration
- `book.controller.js`: HTTP-facing handlers
- `book.routes.js`: endpoint definitions
- `book.validators.js`: request validation rules
- `book.mapper.js`: output shaping for public/admin responses

#### `modules/admin-auth/`

Contains admin login behavior:

- `auth.routes.js`
- `auth.controller.js`
- `auth.service.js`
- `auth.validators.js`

Right now auth still uses a single shared admin password hash from environment variables. The module layout makes it much easier to upgrade later to real admin users and roles.

## Request Flow

The goal of the refactor was to make request handling predictable.

For example, a public books request now follows this path:

```text
HTTP request
  -> route
  -> validator middleware
  -> controller
  -> service
  -> repository
  -> MongoDB
  -> mapper
  -> HTTP response
```

Example:

```text
GET /api/books
  -> src/modules/books/book.routes.js
  -> src/modules/books/book.controller.js
  -> src/modules/books/book.service.js
  -> src/modules/books/book.repository.js
  -> src/modules/books/book.mapper.js
```

This means:

- routes define endpoints
- controllers translate HTTP in/out
- services contain business logic
- repositories own Mongoose queries
- mappers shape the response DTOs

That boundary is what keeps the project maintainable as features grow.

## Books Module Design

The books module now separates public and admin concerns cleanly.

### Public behavior

The public API:

- supports filtering by `genre`, `language`, and `available`
- supports `search`
- supports localized response shaping with `lang`

Instead of returning raw multilingual objects to the public client, the mapper flattens `title` and `description` into the requested language with English fallback.

### Admin behavior

The admin API:

- lists all books
- creates books
- updates books
- deletes books
- toggles availability

Admin routes use the same service/repository structure rather than bypassing the module and touching Mongoose directly.

## Data Model Improvements

The book schema was upgraded in a few useful ways:

- moved into `src/modules/books/book.model.js`
- uses `timestamps: true`
- disables `__v` with `versionKey: false`
- adds indexes for common filtering
- trims string input
- enforces enums and minimum price

This is still a simple model, but it is more disciplined than the original version.

## Validation Strategy

Validation is now handled consistently through `express-validator` plus the shared `validate` middleware.

We validate:

- request body
- query parameters
- route params

Examples:

- invalid Mongo ids are rejected before hitting repository logic
- invalid `lang`, `genre`, or `language` values are rejected early
- invalid book payloads return structured validation responses

This keeps route handlers cleaner and avoids mixing validation mechanics with business logic.

## Error Handling Strategy

The old code used local `try/catch` blocks in route handlers and generic `500` responses. The refactor moved to centralized error handling.

Now:

- async handlers bubble failures through `asyncHandler`
- known errors become typed `AppError` subclasses
- the global error handler converts them into consistent JSON responses
- invalid Mongo ObjectIds return `400`

This gives the backend a more predictable API surface and reduces repetitive error code.

## Auth Design

Admin authentication is still intentionally simple:

- login accepts a password
- password is checked against `ADMIN_PASSWORD_HASH`
- a JWT is issued with `{ admin: true }`
- protected admin book routes require a valid bearer token

This is acceptable for a small internal admin workflow, but not ideal long term.

Future upgrade path:

1. add admin user records in MongoDB
2. support email/username + password
3. add roles/permissions
4. add refresh token or session management
5. add rate limiting and login audit logs

## Environment Variables

Defined in `.env.example`:

- `MONGO_URI`
- `PORT`
- `JWT_SECRET`
- `ADMIN_PASSWORD_HASH`
- `CORS_ORIGIN`

### Notes

- `CORS_ORIGIN` can be set to the frontend dev URL, for example `http://localhost:5173`
- multiple origins can be added as a comma-separated list
- the backend now validates required env vars at startup

## Scripts

Available scripts in `package.json`:

- `npm run dev` - start the backend with nodemon
- `npm start` - start the backend with Node
- `npm run seed` - seed the database through the new script entrypoint

## Health Endpoint

The backend now exposes:

- `GET /health`

This is a small but important production step because deployment platforms and monitors often rely on a simple health check endpoint.

## Why This Structure Is Better

This refactor makes the backend easier to extend safely.

Examples:

- adding categories becomes a new module instead of more logic stuffed into books routes
- changing Mongo queries stays localized in repositories
- changing response shape stays localized in mappers
- changing auth policy stays localized in the auth module and admin middleware
- testing services becomes much easier because the logic is no longer buried in Express handlers

In short, the backend is still simple, but it is now simple in a way that can grow.

## What Is Still Not Fully Production-Grade

This refactor moved the project much closer to a maintainable architecture, but there is still hardening left to do.

Recommended next steps:

1. Add automated tests
   - unit tests for services
   - integration tests for routes
   - auth flow tests

2. Add security middleware
   - `helmet`
   - request rate limiting, especially on admin login

3. Improve logging
   - request logs
   - structured JSON logs
   - correlation/request IDs

4. Improve search and query performance
   - pagination
   - better search strategy
   - more targeted indexes based on real usage

5. Upgrade admin auth
   - real admin users
   - role model
   - better session strategy

6. Add deployment support
   - containerization
   - environment-specific config
   - monitoring and alerting

## Practical Development Notes

- Keep new business logic in services, not controllers.
- Keep raw Mongoose queries in repositories, not services.
- Keep request validation in validators, not inline in routes.
- Keep response shaping in mappers, not repeated in handlers.
- If a feature grows beyond books or auth, give it its own module under `src/modules/`.

That discipline is what will keep this codebase pleasant six months from now.
