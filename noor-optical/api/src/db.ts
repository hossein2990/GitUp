import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (error) => {
  console.error('[db] idle client error', error);
});

export type SqlValue = string | number | boolean | null | Date | object | unknown[];

export const query = async <Row extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: SqlValue[] = [],
): Promise<Row[]> => {
  const result = await pool.query<Row>(text, params);
  return result.rows;
};

export const queryOne = async <Row extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: SqlValue[] = [],
): Promise<Row | null> => {
  const rows = await query<Row>(text, params);
  return rows[0] ?? null;
};

/** Runs `handler` inside a transaction, rolling back on any thrown error. */
export const withTransaction = async <T>(
  handler: (client: pg.PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await handler(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const waitForDatabase = async (attempts = 30, delayMs = 1000): Promise<void> => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      if (attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};
