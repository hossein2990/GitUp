import type { ErrorRequestHandler, RequestHandler } from 'express';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, message, details);
export const unauthorized = (message = 'Authentication required') => new HttpError(401, message);
export const forbidden = (message = 'Not allowed') => new HttpError(403, message);
export const notFoundError = (message = 'Resource not found') => new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);

type AsyncRoute = (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => Promise<unknown>;

/** Wraps an async route so rejected promises reach the error handler. */
export const asyncRoute =
  (handler: AsyncRoute): RequestHandler =>
  (req, res, next) => {
    handler(req, res).catch(next);
  };

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { message: 'Endpoint not found', code: 'not_found' } });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({
      error: { message: error.message, details: error.details ?? null },
    });
    return;
  }
  console.error('[api] unhandled error', error);
  res.status(500).json({ error: { message: 'Unexpected server error' } });
};

/* ---------------------------------------------------------------- validation */

export const requiredString = (
  value: unknown,
  field: string,
  { max = 500, min = 1 }: { max?: number; min?: number } = {},
): string => {
  if (typeof value !== 'string' || value.trim().length < min) {
    throw badRequest(`"${field}" is required`, { field });
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw badRequest(`"${field}" must be at most ${max} characters`, { field });
  }
  return trimmed;
};

export const optionalString = (
  value: unknown,
  field: string,
  max = 2000,
): string | null => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw badRequest(`"${field}" must be a string`, { field });
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
};

export const optionalEmail = (value: unknown, field = 'email'): string | null => {
  const email = optionalString(value, field, 320);
  if (!email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw badRequest('A valid email address is required', { field });
  }
  return email.toLowerCase();
};

export const requiredEmail = (value: unknown, field = 'email'): string => {
  const email = optionalEmail(value, field);
  if (!email) throw badRequest(`"${field}" is required`, { field });
  return email;
};

export const optionalPhone = (value: unknown, field = 'phone'): string | null => {
  const phone = optionalString(value, field, 40);
  if (!phone) return null;
  if (!/^[+()\-\s\d]{6,}$/.test(phone)) throw badRequest('Enter a valid phone number', { field });
  return phone;
};

export const requiredPhone = (value: unknown, field = 'phone'): string => {
  const phone = optionalPhone(value, field);
  if (!phone) throw badRequest(`"${field}" is required`, { field });
  return phone;
};

export const optionalNumber = (value: unknown, field: string): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw badRequest(`"${field}" must be a number`, { field });
  return parsed;
};

export const parsePositiveInt = (value: unknown, fallback: number, max: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
};

export const optionalBoolean = (value: unknown): boolean | null => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return null;
};
