# The Lantern Library

A full-stack, multilingual (English / Urdu with RTL) bookstore catalogue. Customers browse a curated catalogue and order via WhatsApp; admins manage inventory and admin accounts through a protected dashboard.

## Repository layout

```
backend/    Express + TypeScript REST API (MongoDB, Cloudflare R2, JWT auth)
frontend/   React + TypeScript SPA (Vite, Tailwind CSS v4, React Query, i18next)
```

Each package has its own README with full details:

- [backend/README.md](backend/README.md) — API reference, architecture, scripts
- [frontend/README.md](frontend/README.md) — app structure, conventions

## Tech stack

| Layer      | Technology |
| ---------- | ---------- |
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS v4, TanStack React Query, react-router 7, react-i18next |
| Backend    | Node.js 20+, Express 4, TypeScript, Mongoose 8, zod, pino, helmet |
| Database   | MongoDB |
| Storage    | Cloudflare R2 (book cover images, processed with sharp) |
| Auth       | JWT bearer tokens with token-version revocation, role-based access (admin / super_admin) |
| API docs   | OpenAPI 3 — served at `/api/v1/docs` (Swagger UI) |
| Tests      | Vitest (+ Supertest and mongodb-memory-server on the backend, Testing Library on the frontend) |
| Quality    | ESLint (flat config, typescript-eslint), Prettier |

## Quick start

Prerequisites: Node.js >= 20, a local or remote MongoDB.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values (see backend/README.md)
npm run seed           # optional: sample books
npm run create-super-admin
npm run dev            # http://localhost:8000, docs at /api/v1/docs
```

### 2. Frontend

```bash
cd frontend
npm install
# .env.local: VITE_API_URL=http://localhost:8000/api/v1, VITE_WHATSAPP_NUMBER=...
npm run dev            # http://localhost:5173
```

## Common commands

Run these inside `backend/` or `frontend/`:

| Command             | Purpose |
| ------------------- | ------- |
| `npm run dev`       | Start the dev server (hot reload) |
| `npm run build`     | Production build |
| `npm test`          | Run the test suite |
| `npm run lint`      | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm run format`    | Prettier write |

## Deployment notes

- **Backend**: deploy `backend/` to any Node.js host. `npm run build` then `npm start`. All required env vars must be set — the server fails fast with a clear message if any are missing. `CORS_ORIGIN` is **mandatory in production** (comma-separated allowlist). Set `SENTRY_DSN` to enable error tracking.
- **Frontend**: deploy `frontend/dist` to any static host. Set `VITE_API_URL` to the live API base (including `/api/v1`) and `VITE_WHATSAPP_NUMBER` at build time.
