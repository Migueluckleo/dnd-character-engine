// src/api/middleware/auth.ts
// Lightweight profile auth using Node crypto, no paid external service required.

import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../../repositories/character.repository';
import { AppError } from './error-handler';

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const PASSWORD_ITERATIONS = 120_000;
const AUTH_SECRET = process.env['AUTH_SECRET'] ?? 'dev-auth-secret-change-me';
const userDelegate = () => (prisma as any).user;

export type AuthUser = {
  user_id: string;
  email: string;
  display_name: string;
};

type TokenPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64url(input: string): Buffer {
  const padded = input + '='.repeat((4 - (input.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 32, 'sha256').toString('hex');
  return `pbkdf2_sha256$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [algorithm, iterationsRaw, salt, hash] = storedHash.split('$');
  const iterations = Number(iterationsRaw);
  if (algorithm !== 'pbkdf2_sha256' || !iterations || !salt || !hash) return false;
  const candidate = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
  return safeEqual(candidate, hash);
}

export function signAuthToken(user: { user_id: string; email: string }): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    sub: user.user_id,
    email: user.email,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  }));
  const signature = base64url(crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${signature}`;
}

export function verifyAuthToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts as [string, string, string];
  const expected = base64url(crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${payload}`).digest());
  if (!safeEqual(signature, expected)) return null;
  try {
    const parsed = JSON.parse(fromBase64url(payload).toString('utf8')) as TokenPayload;
    if (!parsed.sub || !parsed.email || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

export function currentAuthUser(req: Request): AuthUser | null {
  return ((req as Request & { authUser?: AuthUser }).authUser ?? null);
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = readBearerToken(req);
    if (!token) { next(); return; }
    const payload = verifyAuthToken(token);
    if (!payload) { next(); return; }
    const user = await userDelegate().findUnique({
      where: { user_id: payload.sub },
      select: { user_id: true, email: true, display_name: true },
    });
    if (user) (req as Request & { authUser?: AuthUser }).authUser = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!currentAuthUser(req)) {
    next(new AppError(401, 'Authentication required.', 'Debes iniciar sesión para continuar.'));
    return;
  }
  next();
}

export async function characterAccessGuard(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const user = currentAuthUser(req);
    if (!user) { next(); return; }
    const characterId = req.params['id'];
    if (!characterId) { next(); return; }
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: { id: true, user_id: true },
    });
    if (!character) {
      throw new AppError(404, 'Character not found.', 'Personaje no encontrado.');
    }
    if (character.user_id && character.user_id !== user.user_id) {
      throw new AppError(403, 'Character belongs to another profile.', 'Este personaje pertenece a otro perfil.');
    }
    next();
  } catch (err) {
    next(err);
  }
}
