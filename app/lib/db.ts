import postgres from 'postgres';

if (!process.env.POSTGRES_URL) {
  throw new Error('Missing POSTGRES_URL environment variable');
}

const options = {
  ssl: 'require' as const,
  max: 5,
  idle_timeout: 30,
  connect_timeout: 20,
  prepare: false,
  simple: true,
  // Disable server-side statement timeout to avoid cancellations; rely on Next timeouts instead.
  statement_timeout: 0,
  backoff: (retries: number) => Math.min(500 + retries * 200, 2000),
};

declare global {
  // eslint-disable-next-line no-var
  var _sql: ReturnType<typeof postgres> | undefined;
}

const sql = globalThis._sql ?? postgres(process.env.POSTGRES_URL, options);
if (process.env.NODE_ENV !== 'production') {
  globalThis._sql = sql;
}

export default sql;
