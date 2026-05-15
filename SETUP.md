# DnD Character Engine — Setup Guide

## Prerequisites
- Node.js 20.x
- PostgreSQL 14+ running locally

## First-time setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and fill in your DB credentials
cp .env.example .env
# Edit .env → set DATABASE_URL

# 3. Run database migrations (creates all tables)
npm run db:migrate

# 4. Seed static catalogs (races, classes, spells, etc.)
npm run db:seed

# 5. Start backend development server
npm run dev

# 6. In another terminal, start frontend development server
npm run dev:web
```

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start server with ts-node (hot reload) |
| `npm run dev:web` | Start Vite dev server for `ui.html` |
| `npm run build:web` | Build the static frontend into `_site/` |
| `npm run preview` | Preview the Vite production build locally |
| `npm run preview:static` | Serve the built `_site/` folder with Python |
| `npm run build` | Compile TypeScript to dist/ |
| `npm run test` | Run all tests |
| `npm run test:unit` | Unit tests only (services) |
| `npm run test:integration` | Integration tests |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Seed static catalogs |
| `npm run db:reset` | Reset DB and re-seed |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run typecheck:web` | Frontend TypeScript type check (no emit) |

## API Base URL
```
http://localhost:3000
```

## Local UI preview without login

Use this when you need to inspect UI changes before publishing:

```bash
npm run build:web
npm run preview
```

Open:

```text
http://127.0.0.1:4173/preview.html
```

This loads `ui.html?preview=1`, uses an in-memory demo profile and mock data, and does not call the deployed API or production data.

The preview mock API is loaded from `src/client/preview.ts` through Vite. If preview behavior changes, update that module and document the change in `CHANGELOG.md` and `HANDOFF.md`.

Legacy frontend utilities are loaded from `src/client/legacy-utils.ts` through Vite and exposed as `window.DND_UTILS` while `ui.html` is being migrated. Keep new pure helpers there instead of adding more inline utility code to `ui.html`.

## Key endpoints
- `GET  /health` — Server health check
- `POST /characters` — Create character (Point Buy validation)
- `GET  /characters/:id` — Get hydrated character sheet
- `POST /characters/:id/damage` — Apply damage
- `POST /characters/:id/heal` — Heal character
- `POST /characters/:id/death-save` — Record death saving throw
- `POST /characters/:id/short-rest` — Trigger short rest
- `POST /characters/:id/long-rest` — Trigger long rest
- `POST /characters/:id/cast` — Cast a spell
- `POST /characters/:id/multiclass` — Add multiclass (prerequisite validated)

See `docs/plan.md §5` for the full API reference.
