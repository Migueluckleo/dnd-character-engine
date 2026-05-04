// src/api/controllers/auth.controller.ts
// US-132: player profiles, login, and owned character rosters.

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../repositories/character.repository';
import { AppError } from '../middleware/error-handler';
import {
  currentAuthUser,
  hashPassword,
  optionalAuth,
  requireAuth,
  signAuthToken,
  verifyPassword,
} from '../middleware/auth';

export const authRouter = Router();
const userDelegate = () => (prisma as any).user;

const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().trim().min(1).max(80).optional(),
});

const LoginSchema = AuthSchema.pick({ email: true, password: true });

function publicUser(user: { user_id: string; email: string; display_name: string }) {
  return {
    user_id: user.user_id,
    email: user.email,
    display_name: user.display_name,
  };
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = AuthSchema.parse(req.body);
    const email = body.email.trim().toLowerCase();
    const existing = await userDelegate().findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, 'Email already registered.', 'Ese correo ya tiene un perfil registrado.');
    }
    const user = await userDelegate().create({
      data: {
        email,
        display_name: body.display_name?.trim() || email.split('@')[0] || 'Jugador',
        password_hash: hashPassword(body.password),
      },
      select: { user_id: true, email: true, display_name: true },
    });
    res.status(201).json({ token: signAuthToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = LoginSchema.parse(req.body);
    const email = body.email.trim().toLowerCase();
    const user = await userDelegate().findUnique({
      where: { email },
      select: { user_id: true, email: true, display_name: true, password_hash: true },
    });
    if (!user || !verifyPassword(body.password, user.password_hash)) {
      throw new AppError(401, 'Invalid profile credentials.', 'Correo o contraseña incorrectos.');
    }
    res.json({ token: signAuthToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', optionalAuth, requireAuth, (req, res) => {
  const user = currentAuthUser(req)!;
  res.json({ user: publicUser(user) });
});

authRouter.post('/logout', (_req, res) => {
  res.json({ message: 'Sesión cerrada.' });
});
