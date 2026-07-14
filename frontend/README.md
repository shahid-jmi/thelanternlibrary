# The Lantern Library — Frontend

React + TypeScript single-page app for the public catalogue and the admin dashboard. Originally scaffolded from a Figma Make export, since restructured into a conventional feature-based layout.

- **Build**: Vite 6, Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Data**: TanStack React Query over a typed axios client
- **Routing**: react-router 7 with an auth guard for admin pages
- **i18n**: react-i18next, English + Urdu (RTL handled at the document level)

## Getting started

```bash
npm install
npm run dev     # http://localhost:5173
```

`.env.local`:

```
VITE_API_URL=http://localhost:8000/api/v1
VITE_WHATSAPP_NUMBER=<country code + number, no + or spaces>
```

If `VITE_API_URL` is unset the app calls `/api/v1` relative to its own origin (the Vite dev server proxies `/api` to `localhost:8000`).

## Scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Vite dev server with API proxy |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Vitest + Testing Library (jsdom) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `format` | ESLint / Prettier |

## Structure

```text
src/
  main.tsx              entry: i18n provider + App
  i18n.ts               i18next setup (en/ur resources in src/locales)
  styles/               Tailwind entry, fonts, theme tokens
  app/
    App.tsx             providers (React Query, Router, Auth) + routes
    api/                axios client, domain types, request functions
                        (client.ts handles auth headers + global 401 handling)
    auth/               AuthContext (login/logout/current admin),
                        RequireAdmin route guard, token storage
    queries/            React Query hooks (queries + mutations with invalidation)
    components/         Shell (nav), BookCard, form controls, status/layout helpers
    pages/              HomePage, BookDetailPage, AdminLoginPage,
                        AdminDashboardPage, AdminManagementPage
  test/                 vitest setup (jsdom + jest-dom)
```

Conventions:

- Components never call axios directly — pages use the hooks in `queries/`, which call the functions in `api/`.
- The admin JWT lives in `localStorage` (`auth/authStorage.ts`); the axios client attaches it to requests and clears it on any 401, redirecting to the login page via `AuthContext`.
- All admin routes sit behind `RequireAdmin`; super-admin-only UI is gated with `useAuth().isSuperAdmin` (the API enforces it server-side regardless).
