// src/index.ts — Application entry point
import express from 'express';
import { characterRouter }   from './api/controllers/character.controller';
import { combatRouter }      from './api/controllers/combat.controller';
import { conditionRouter }   from './api/controllers/condition.controller';
import { restRouter }        from './api/controllers/rest.controller';
import { spellRouter }       from './api/controllers/spell.controller';
import { inventoryRouter }   from './api/controllers/inventory.controller';
import { catalogRouter }     from './api/controllers/catalog.controller';
import { authRouter }        from './api/controllers/auth.controller';
import { errorHandler }      from './api/middleware/error-handler';
import { characterAccessGuard, optionalAuth } from './api/middleware/auth';

const app = express();

const allowedOrigins = (process.env['ALLOWED_ORIGINS'] ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (allowedOrigins.length === 0) return process.env['NODE_ENV'] !== 'production';
  return allowedOrigins.includes(origin);
}

// CORS — in production, set ALLOWED_ORIGINS to the GitHub Pages/custom domains.
app.use((_req, res, next) => {
  const origin = _req.headers.origin;
  if (!isAllowedOrigin(origin)) {
    if (_req.method === 'OPTIONS') { res.sendStatus(403); return; }
    next();
    return;
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Origin', origin ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routers
app.use('/auth', authRouter);
app.use('/characters', optionalAuth);
app.use('/characters/:id', characterAccessGuard);
app.use('/characters', characterRouter);
app.use('/characters', combatRouter);
app.use('/characters', conditionRouter);
app.use('/characters', restRouter);
app.use('/characters', spellRouter);
app.use('/characters', inventoryRouter);
app.use('/catalog',    catalogRouter);

// Global error handler — must be last
app.use(errorHandler);

const PORT = process.env['PORT'] ?? 3000;
app.listen(PORT, () => console.log(`DnD Engine running on port ${PORT}`));

export { app };
