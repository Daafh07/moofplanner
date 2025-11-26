import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { revenue, users, events } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

async function seedRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

async function seedEvents() {
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      title TEXT NOT NULL,
      event_date DATE NOT NULL,
      attendees INT NOT NULL,
      category TEXT NOT NULL
    );
  `;

  const insertedEvents = await Promise.all(
    events.map(
      (event) => sql`
        INSERT INTO events (id, title, event_date, attendees, category)
        VALUES (${event.id}, ${event.title}, ${event.event_date}, ${event.attendees}, ${event.category})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedEvents;
}

export async function GET() {
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.ALLOW_SEED !== 'true'
  ) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const result = await sql.begin((sql) => [
      seedUsers(),
      seedRevenue(),
      seedEvents(),
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
