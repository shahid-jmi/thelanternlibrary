# The Lantern Library — Backend

Express + TypeScript REST API for the bookstore catalogue and admin panel.

- **Runtime**: Node.js 20+, ESM
- **Framework**: Express 4 with a layered module structure
- **Database**: MongoDB via Mongoose 8
- **Storage**: Cloudflare R2 for cover images (resized to WebP with sharp)
- **Validation**: zod for both environment config and request payloads
- **Auth**: JWT bearer tokens (24h expiry) with a `tokenVersion` claim so deactivating an admin (or force-resetting their password) revokes their outstanding tokens. Self-service change/forgot/reset password flows, plus super-admin-forced password resets — see [Password management](#password-management) below.
- **Email**: nodemailer for password-reset links. Optional — if SMTP isn't configured, reset links are logged instead of emailed (fine for dev, must be set in production)
- **Observability**: pino structured logging (pretty-printed in dev), optional Sentry error tracking
- **Security**: helmet, fail-closed CORS allowlist, login rate limiting (5 failed attempts / 15 min)
- **Docs**: OpenAPI 3 served at `/api/v1/docs` (Swagger UI) and `/api/v1/docs.json`

## Getting started

```bash
npm install
cp .env.example .env    # fill in values — see comments in the file
npm run seed            # optional sample data
npm run create-super-admin
npm run dev             # tsx watch, http://localhost:8000
```

The server validates its environment at boot and exits with a descriptive error if anything required is missing. In production `CORS_ORIGIN` must be set explicitly; in development it defaults to `http://localhost:5173`.

## Scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Dev server with reload (`tsx watch`) |
| `npm run build` | Compile to `dist/` with `tsc` |
| `npm start` | Run the compiled server (`dist/server.js`) |
| `npm test` | Vitest — unit + API integration tests (in-memory MongoDB) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `format` | ESLint / Prettier |
| `npm run seed` | Replace all books with sample data |
| `npm run create-super-admin` | Interactive prompt to create the first super admin |
| `npm run migrate-auth-fields` | **Run once against your real database** before/after deploying the password-management feature — backfills `mustChangePassword`, `passwordChangedAt`, etc. onto admin accounts created before it existed. Safe to re-run. |

The remaining `migrate-*` / `remove-*` scripts are historical one-time data migrations, kept for reference.

## API

All routes are mounted under **`/api/v1`**. Interactive documentation lives at **`/api/v1/docs`**.

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/books` | — | List books (filters: `lang`, `genre`, `language`, `available`, `search`) |
| GET | `/books/:id` | — | Single book, localized via `lang` |
| POST | `/admin/auth/login` | — | Login, returns `{ token, mustChangePassword, admin: {id, email, role} }` (rate limited) |
| POST | `/admin/auth/change-password` | admin | Change your own password (`{ currentPassword, newPassword }`) |
| POST | `/admin/auth/forgot-password` | — | Request a reset link by email; always returns the same generic response (rate limited) |
| POST | `/admin/auth/reset-password` | — | Complete a reset with the emailed token (`{ token, newPassword }`) |
| GET | `/admin/books` | admin | All books with full localized fields |
| POST | `/admin/books` | admin | Create book (`multipart/form-data`, optional `coverImage`) |
| PUT | `/admin/books/:id` | admin | Update book (replaces cover if a new image is sent) |
| DELETE | `/admin/books/:id` | admin | Delete book and its stored cover |
| PATCH | `/admin/books/:id/availability` | admin | Toggle availability |
| GET / POST | `/admin/admins` | super_admin | List / create admin accounts (created admins get `mustChangePassword: true`) |
| DELETE | `/admin/admins/:id` | super_admin | Delete an admin (not yourself) |
| PATCH | `/admin/admins/:id/deactivate` | super_admin | Deactivate + revoke tokens (not yourself) |
| PATCH | `/admin/admins/:id/reactivate` | super_admin | Reactivate |
| PATCH | `/admin/admins/:id/role` | super_admin | Change role (not your own) |
| PATCH | `/admin/admins/:id/force-password-reset` | super_admin | Force-generate a temporary password for another admin (not yourself); returned once in the response, revokes their existing sessions |

Error responses share one shape: `{ "message": string, "details"?: [{ "path": string, "msg": string }] }`.

### Password management

Four flows, all under `/admin/auth` (login/forgot/reset are public; change-password and force-reset require a token):

1. **Change password** (self-service, logged in) — `POST /admin/auth/change-password` verifies the current password, enforces the policy (min 8 characters), and rejects a new password identical to the old one.
2. **Forgot / reset password** (self-service, logged out):
   - `POST /admin/auth/forgot-password` with `{ email }` — looks up the account, and **regardless of whether it exists**, returns the same generic `200` message. If it does exist, a cryptographically random token (`crypto.randomBytes(32)`) is generated, only its SHA-256 hash is stored (`passwordResetTokenHash` + `passwordResetExpiresAt`, 30-minute TTL), and an email is sent (or logged — see below) containing `${FRONTEND_URL}/reset-password?token=<raw token>`.
   - `POST /admin/auth/reset-password` with `{ token, newPassword }` — hashes the incoming token, looks it up, checks it hasn't expired, and if valid sets the new password and clears the reset token (single-use).
3. **Force change on creation** — when a super admin creates an admin, that account is flagged `mustChangePassword: true`. The frontend reads this from the login response and redirects to the change-password page before letting the admin do anything else.
4. **Super admin force reset** — `PATCH /admin/admins/:id/force-password-reset` generates a new temporary password server-side, hashes it, stores it, sets `mustChangePassword: true`, revokes the admin's existing sessions, and returns the plaintext temporary password **once** in the response (never stored, never retrievable again).

**Email delivery**: `mail.service.ts` uses nodemailer. If `SMTP_HOST`/`SMTP_PORT` aren't set (see `.env.example`), it doesn't fail — it logs the reset link via pino instead of sending an email, which is what happens by default in dev/test. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, and `FRONTEND_URL` to actually deliver reset emails in production (Gmail SMTP with an app password is the fastest way to get this working; a transactional provider like Resend/Brevo/SendGrid is better for deliverability at scale).

## Architecture

```text
src/
  server.ts             boot: Sentry instrumentation → DB connect → listen, graceful shutdown
  app.ts                createApp(): middleware + /api/v1 router + docs + error handling
  instrument.ts         Sentry init (no-op without SENTRY_DSN)
  config/               env (zod-validated), db, cors, r2 client
  docs/openapi.ts       hand-written OpenAPI 3 document
  common/
    errors/             AppError hierarchy (Validation/Unauthorized/Forbidden/NotFound)
    middleware/         authenticateAdmin, requireSuperAdmin, validate (zod),
                        uploadCoverImage (multer), parseJsonFormFields,
                        httpLogger (pino-http), errorHandler, notFound
    validation/         shared zod helpers (objectId, booleanFromString)
  modules/
    books/              routes → controller → service → repository → model
                        + validators (zod), mapper (DTOs), cover-image.service (R2 + sharp)
    admin-auth/         login flow, Admin model + repository
    admins/             admin account management (super admin only)
  scripts/              seed, createSuperAdmin, historical migrations
  test/                 vitest setup, in-memory Mongo helpers, API integration tests
```

Conventions:

- **Layering**: controllers only translate HTTP ↔ service calls; services hold business logic; repositories are the only layer touching Mongoose.
- **Validation**: every route validates `params` / `query` / `body` with zod schemas via the `validate` middleware. Types are inferred from the schemas (`z.infer`) and shared with services.
- **Errors**: throw `AppError` subclasses anywhere; the central `errorHandler` renders them. Unknown errors log with a stack and return a generic 500 (and go to Sentry when enabled).

## Testing

```bash
npm test
```

Integration tests spin up `mongodb-memory-server` (first run downloads a MongoDB binary) and drive the real Express app with Supertest — no mocks between the route and the database. See `src/test/`.
