# DnD Character Engine — Setup Guide

## Prerequisites
- Node.js 18+
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

# 5. Start development server
npm run dev
```

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start server with ts-node (hot reload) |
| `npm run preview` | Serve the static local preview on port 5500 without login/API calls |
| `npm run build` | Compile TypeScript to dist/ |
| `npm run test` | Run all tests |
| `npm run test:unit` | Unit tests only (services) |
| `npm run test:integration` | Integration tests |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Seed static catalogs |
| `npm run db:reset` | Reset DB and re-seed |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run typecheck` | TypeScript type check (no emit) |

## API Base URL
```
http://localhost:3000
```

## Local UI preview without login

Use this when you need to inspect UI changes before publishing:

```bash
npm run preview
```

Open:

```text
http://127.0.0.1:5500/preview.html
```

This loads `ui.html?preview=1`, uses an in-memory demo profile and mock data, and does not call the deployed API or production data.

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
