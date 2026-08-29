# Environments: Dev, Staging, Production

Right now there's one backend (Render) and one frontend (Vercel) deployment. This is a
step-by-step guide for splitting that into separate **development**, **staging**, and
**production** environments — so you can test changes on `develop` without any risk to the
live site or its real customer data.

No code changes are required for any of this. It's entirely environment variables, hosting
dashboard configuration, and (critically) a second database.

## The core idea

Same codebase everywhere. What differs per environment:

| Varies per environment | Where it's set |
| --- | --- |
| Which MongoDB database the backend writes to | Render env var `MONGO_URI` |
| Which frontend origin(s) the backend allows via CORS | Render env var `CORS_ORIGIN` |
| Which API URL the frontend calls | Vercel env var `VITE_API_URL` |
| Which git branch deploys where | Render/Vercel branch settings |

## Step 1 — Create a second database (do this first)

Never let dev/staging testing touch the same database as real orders and admin accounts.

Options, either works:
- A second database name in your existing MongoDB Atlas cluster (e.g. `bookstore_dev` next
  to `bookstore`), or
- A whole separate free-tier Atlas cluster for non-production use.

Take the resulting connection string and keep it aside — it becomes the dev/staging
`MONGO_URI`.

## Step 2 — Backend: a second Render service

Render supports multiple independent Web Services from the same GitHub repo, each on its own
branch with its own environment variables.

1. In Render, create a new Web Service pointing at this same repo, root directory `backend/`,
   but set its branch to `develop` instead of `main`.
2. Give it its own env vars (copy the shape from [`backend/.env.example`](backend/.env.example)),
   using the **dev/staging** database from Step 1:
   - `MONGO_URI` → the dev/staging connection string
   - `CORS_ORIGIN` → the staging frontend's origin (see Step 3 — you'll fill this in once that
     exists)
   - `FRONTEND_URL` → the staging frontend's URL (used to build password-reset email links)
   - `JWT_SECRET` → generate a **different** secret than production (`openssl rand -hex 32`) —
     don't reuse the prod one
   - Everything else (`R2_*`, `SMTP_*`, `SENTRY_DSN`, `LOG_LEVEL`) — either point at
     dev/staging equivalents if you have them, or leave the optional ones unset
3. Your existing Render service (on `main`) stays as-is — that's production. Just confirm its
   `CORS_ORIGIN` only lists the production frontend domain.

You'll end up with two backend URLs, e.g.:
- Production: `https://lantern-library-api.onrender.com`
- Staging: `https://lantern-library-api-staging.onrender.com`

## Step 3 — Frontend: Vercel's built-in environment scoping

Vercel already deploys `main` as "Production" and every other branch/PR as a "Preview" —
that part needs no setup. What to configure is the **environment variables per scope**:

1. In Vercel → Project Settings → Environment Variables, add `VITE_API_URL` twice:
   - Scope **Production** → your production backend URL + `/api/v1`
   - Scope **Preview** → your staging backend URL + `/api/v1`
2. Do the same for `VITE_WHATSAPP_NUMBER` if it should differ (usually it won't).
3. Trigger a new deploy of `develop` (push a commit, or redeploy) so it picks up the Preview
   values.

Vercel preview URLs are unique per deploy and change often — if you want a stable staging
URL to hand to the backend's `CORS_ORIGIN` (Step 2), either:
- Use Vercel's **branch alias** for `develop` (Project Settings → Domains → assign a domain
  to the `develop` branch — it stays constant across deploys of that branch), or
- Add a Vercel wildcard/preview domain pattern and update `CORS_ORIGIN` accordingly.

Once you have a stable staging frontend URL, go back and fill in the staging backend's
`CORS_ORIGIN` from Step 2.

## Step 4 — Local development

No changes needed here — keep using `frontend/.env.local` and `backend/.env` exactly as you
do now, pointed at `localhost`. These are already gitignored and separate from both Render
and Vercel's stored values.

## Summary checklist

- [ ] Second MongoDB database created, connection string saved
- [ ] Second Render service created, branch = `develop`, own `MONGO_URI` / `JWT_SECRET` / etc.
- [ ] Vercel `VITE_API_URL` (and `VITE_WHATSAPP_NUMBER` if needed) split into Production /
      Preview scopes
- [ ] Stable staging frontend URL established (branch alias or fixed domain)
- [ ] Staging backend's `CORS_ORIGIN` updated to match that stable staging URL
- [ ] Production backend's `CORS_ORIGIN` confirmed to list only the production domain

## Reference

- [`backend/.env.example`](backend/.env.example) — full list of backend env vars and what
  each does
- [`backend/README.md`](backend/README.md) — password-reset email setup, CORS details
- [`frontend/README.md`](frontend/README.md) — frontend env vars and structure
