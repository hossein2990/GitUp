import { Router } from 'express';
import {
  hashPassword,
  publicUser,
  requireAuth,
  signToken,
  verifyPassword,
} from '../auth.js';
import { query, queryOne } from '../db.js';
import {
  asyncRoute,
  badRequest,
  conflict,
  optionalPhone,
  optionalString,
  requiredEmail,
  requiredString,
  unauthorized,
} from '../http.js';

export const authRouter = Router();

type CustomerRow = {
  id: number;
  email: string;
  password_hash: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
};

authRouter.post(
  '/auth/register',
  asyncRoute(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const email = requiredEmail(body.email);
    const password = requiredString(body.password, 'password', { min: 8, max: 120 });
    const fullName = requiredString(body.fullName, 'fullName', { max: 160 });
    const phone = optionalPhone(body.phone);

    const existing = await queryOne<{ id: number }>('SELECT id FROM customers WHERE email = $1', [email]);
    if (existing) throw conflict('An account with this email already exists');

    const passwordHash = await hashPassword(password);
    const row = await queryOne<CustomerRow>(
      `INSERT INTO customers (email, password_hash, full_name, phone, role)
       VALUES ($1, $2, $3, $4, 'customer')
       RETURNING id, email, password_hash, full_name, phone, role`,
      [email, passwordHash, fullName, phone],
    );
    if (!row) throw badRequest('Could not create the account');

    const user = { id: row.id, email: row.email, role: row.role, fullName: row.full_name };
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  }),
);

authRouter.post(
  '/auth/login',
  asyncRoute(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const email = requiredEmail(body.email);
    const password = requiredString(body.password, 'password', { max: 120 });

    const row = await queryOne<CustomerRow>('SELECT * FROM customers WHERE email = $1', [email]);
    if (!row) throw unauthorized('Email or password is incorrect');

    const matches = await verifyPassword(password, row.password_hash);
    if (!matches) throw unauthorized('Email or password is incorrect');

    const user = { id: row.id, email: row.email, role: row.role, fullName: row.full_name };
    res.json({ token: signToken(user), user: publicUser(user) });
  }),
);

authRouter.get(
  '/auth/me',
  requireAuth,
  asyncRoute(async (req, res) => {
    res.json({ user: publicUser(req.user!) });
  }),
);

authRouter.patch(
  '/auth/me',
  requireAuth,
  asyncRoute(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const fullName = optionalString(body.fullName, 'fullName', 160);
    const phone = optionalPhone(body.phone);
    const row = await queryOne<CustomerRow>(
      `UPDATE customers
       SET full_name = COALESCE($2, full_name), phone = COALESCE($3, phone)
       WHERE id = $1
       RETURNING id, email, password_hash, full_name, phone, role`,
      [req.user!.id, fullName, phone],
    );
    if (!row) throw badRequest('Could not update the profile');
    res.json({
      user: publicUser({ id: row.id, email: row.email, role: row.role, fullName: row.full_name }),
    });
  }),
);

/** Guest order history lookup used by the account page. */
authRouter.post(
  '/account/lookup',
  asyncRoute(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const email = requiredEmail(body.email);
    const rows = await query<{ order_number: string }>(
      'SELECT order_number FROM orders WHERE LOWER(email) = $1 ORDER BY created_at DESC LIMIT 20',
      [email],
    );
    res.json({ orderNumbers: rows.map((row) => row.order_number) });
  }),
);
