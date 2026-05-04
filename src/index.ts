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

// CORS — permite peticiones desde ui.html (file://) y cualquier origen local
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

app.use(express.json());

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
