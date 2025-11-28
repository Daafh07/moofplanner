import postgres from 'postgres';

const createClient = () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('Missing POSTGRES_URL environment variable');
  }
  return postgres(process.env.POSTGRES_URL, {
    ssl: 'require',
    max: 5, // keep pool small to avoid hitting Supabase limits
    idle_timeout: 5,
    connect_timeout: 10,
  });
};

declare global {
  // eslint-disable-next-line no-var
  var _sql: ReturnType<typeof postgres> | undefined;
}

const sql = globalThis._sql ?? createClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis._sql = sql;
}

export default sql;
