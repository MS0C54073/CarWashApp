# SuCAR / SUKA Car Wash System

Monorepo for the SuCAR car wash pickup booking system. It includes a backend API,
web frontend, admin dashboard, and a mobile app, plus shared TypeScript types and
Supabase database migrations.

## Repository structure

- `backend/` - Node/Express API with Supabase/Postgres integrations
- `frontend/` - Vite + React customer-facing web app
- `dashboard-nextjs/` - Next.js admin dashboard
- `mobile/` - Expo React Native app
- `shared-types/` - Shared TypeScript types package
- `supabase/` - Supabase config and SQL migrations

## Prerequisites

- Node.js (LTS recommended)
- npm (or your preferred Node package manager)
- Supabase (local or hosted)
- Expo CLI (for running the mobile app)

## Environment configuration

See `backend/ENV_VARIABLES.md` for required backend variables and
`backend/SUPABASE_SETUP.md` for local Supabase setup details.

## Quick start

Install dependencies per package:

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../dashboard-nextjs && npm install
cd ../mobile && npm install
cd ../shared-types && npm install
```

Run the backend API:

```bash
cd backend
npm run dev
```

Run the customer web app:

```bash
cd frontend
npm run dev
```

Run the admin dashboard:

```bash
cd dashboard-nextjs
npm run dev
```

Run the mobile app:

```bash
cd mobile
npm run start
```

Build shared types (if needed by other packages):

```bash
cd shared-types
npm run build
```

## Database and migrations

Supabase migrations live in `supabase/migrations/`. The backend includes helper
scripts for migrations under `backend/scripts/` and `backend/src/migrations/`.
Review `backend/README_MIGRATION.md` for details.

## Notes

- If you add or update shared types, rebuild `shared-types` before running other
  packages that depend on it.
- PowerShell helper scripts are available in `backend/` for local workflows.
