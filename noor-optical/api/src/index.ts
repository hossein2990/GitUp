import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { pool, waitForDatabase } from './db.js';
import { attachUser } from './auth.js';
import { errorHandler, notFoundHandler } from './http.js';
import { catalogRouter } from './routes/catalog.js';
import { contentRouter } from './routes/content.js';
import { ordersRouter } from './routes/orders.js';
import { authRouter } from './routes/auth.js';
import { formsRouter } from './routes/forms.js';
import { adminRouter } from './routes/admin.js';

const app = express();
app.disable('x-powered-by');

/**
 * The storefront is served same-origin (the dev server proxies /api), so CORS is
 * only relevant for separate-origin clients and webhooks. Host values are read
 * from the environment because preview/sandbox hosts rotate between sessions.
 */
const originAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (config.corsOrigins.includes(origin)) return true;
  if (config.previewHostSuffix && origin.endsWith(`-${config.previewHostSuffix}`)) return true;
  if (config.sandboxHostDomain && origin.endsWith(`.${config.sandboxHostDomain}`)) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => callback(null, originAllowed(origin)),
    credentials: true,
  }),
);
app.use(express.json({ limit: '256kb' }));
app.use(attachUser);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'up', preview: config.isPreview });
  } catch (error) {
    res.status(503).json({ status: 'degraded', database: 'down' });
  }
});

app.use('/api', catalogRouter);
app.use('/api', contentRouter);
app.use('/api', authRouter);
app.use('/api', ordersRouter);
app.use('/api', formsRouter);
app.use('/api/admin', adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const start = async () => {
  await waitForDatabase();
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[api] NOOR OPTICAL API listening on 0.0.0.0:${config.port}`);
  });
};

start().catch((error) => {
  console.error('[api] failed to start', error);
  process.exit(1);
});
