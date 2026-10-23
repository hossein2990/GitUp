import type { NextFunction, Request, RequestHandler, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { queryOne } from './db.js';
import { forbidden, unauthorized } from './http.js';

export type UserRole = 'customer' | 'admin';

export type AuthUser = {
  id: number;
  email: string;
  role: UserRole;
  fullName: string | null;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const signToken = (user: AuthUser): string =>
  jwt.sign(
    { sub: String(user.id), email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
  );

const readToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

/** Attaches `req.user` when a valid token is present; never rejects. */
export const attachUser: RequestHandler = async (req, _res, next) => {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub?: string };
    if (!payload.sub) return next();
    const row = await queryOne<{
      id: number;
      email: string;
      full_name: string | null;
      role: UserRole;
    }>('SELECT id, email, full_name, role FROM customers WHERE id = $1', [Number(payload.sub)]);
    if (row) {
      req.user = { id: row.id, email: row.email, role: row.role, fullName: row.full_name };
    }
  } catch {
    // Invalid or expired tokens are treated as anonymous visitors.
  }
  return next();
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  return next();
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  if (req.user.role !== 'admin') return next(forbidden('Staff access required'));
  return next();
};

export const publicUser = (user: AuthUser) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
});

export const resolveUser = (res: Response, next: NextFunction) => {
  void res;
  next();
};
