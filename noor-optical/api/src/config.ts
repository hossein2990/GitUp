/**
 * Runtime configuration.
 *
 * Local infrastructure values (database URL) carry development defaults so the
 * compose stack boots without any manual setup. Anything a real deployment must
 * override is read from the environment and documented in noor-optical/README.md.
 */

const asNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const asList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export const config = {
  port: asNumber(process.env.PORT, 8000),
  databaseUrl:
    process.env.DATABASE_URL ?? 'postgres://noor:noor@db:5432/noor_optical',

  /**
   * Development default only. Production must provide JWT_SECRET through the
   * environment (Base44 delivers it to /run/base44/app.env).
   */
  jwtSecret: process.env.JWT_SECRET ?? 'noor-optical-development-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '14d',

  /** Seeded staff account. Replace before going live. */
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@nooroptical.example',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'NoorAdmin!234',

  /**
   * Extra browser origins allowed to call the API directly. The storefront
   * itself is served same-origin (Vite proxies /api), so this is only needed
   * for separate-origin clients and webhooks.
   */
  corsOrigins: asList(process.env.CORS_ORIGINS),

  /**
   * Preview host suffixes are environment specific and rotate, so they are read
   * from the environment at runtime instead of being baked into any file.
   */
  previewHostSuffix: process.env.BASE44_PUBLIC_HOST_SUFFIX,
  sandboxHostDomain: process.env.BASE44_SANDBOX_HOST_DOMAIN,
  isPreview: process.env.BASE44_PREVIEW_MODE === '1',

  defaultCurrency: process.env.DEFAULT_CURRENCY ?? 'IRT',
} as const;
