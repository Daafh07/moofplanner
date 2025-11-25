import postgres from 'postgres';
import { CustomerField, Revenue, FormattedCustomersTable } from './definitions';
import { formatCurrency } from './utils';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

type CompanySnapshot = {
  id: string;
  name: string;
  plan: string;
  headcount: number;
  region: string;
  seat_limit: number | null;
  billing_mode: string;
};

export async function fetchCompanySnapshot(userId?: string) {
  let result: CompanySnapshot[];
  if (userId) {
    result = await sql<CompanySnapshot[]>`
      SELECT c.id, c.name, c.plan, c.headcount, c.region, c.seat_limit, c.billing_mode
      FROM companies c
      JOIN company_admins ca ON ca.company_id = c.id
      WHERE ca.user_id = ${userId}
      ORDER BY c.created_at DESC
      LIMIT 1
    `;
  } else {
    result = await sql<CompanySnapshot[]>`
      SELECT id, name, plan, headcount, region, seat_limit, billing_mode
      FROM companies
      ORDER BY created_at DESC
      LIMIT 1
    `;
  }
  return result[0] ?? null;
}

export async function fetchDashboardMetrics() {
  const [{ total_headcount }] = await sql<{ total_headcount: number | null }[]>`
    SELECT COALESCE(SUM(headcount), 0) AS total_headcount FROM companies
  `;

  const scheduledHours = Number(total_headcount ?? 0) * 38;

  return {
    weeklyLaborCost: formatCurrency(0),
    scheduledHours: `${scheduledHours.toLocaleString()} u`,
    hourlyCost: formatCurrency(0),
    openTasks: 0,
  };
}

export async function fetchPendingApprovals() {
  return [];
}

export async function fetchUpcomingEvents() {
  const data = await sql<{ id: string; title: string; event_date: string; attendees: number }[]>`
    SELECT id, title, event_date, attendees
    FROM events
    ORDER BY event_date ASC
    LIMIT 3
  `;
  return data.map((event) => ({
    label: event.title,
    day: new Date(event.event_date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' }),
    people: event.attendees,
  }));
}

export async function fetchOrganizationCards(userId?: string) {
  if (userId) {
    return sql<{ name: string; email: string; role: string | null }[]>`
      SELECT u.name, u.email, ca.role
      FROM company_admins ca
      JOIN users u ON ca.user_id = u.id
      WHERE ca.company_id = (
        SELECT company_id FROM company_admins WHERE user_id = ${userId} LIMIT 1
      )
      LIMIT 4
    `;
  }
  return sql<{ name: string; email: string; role: string | null }[]>`
    SELECT u.name, u.email, ca.role
    FROM company_admins ca
    JOIN users u ON ca.user_id = u.id
    LIMIT 4
  `;
}

export async function fetchRevenue() {
  try {
    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchCardData() {
  const customerCount = await sql`SELECT COUNT(*) FROM customers`;

  return {
    numberOfCustomers: Number(customerCount[0].count ?? '0'),
  };
}

export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<{
      id: string;
      name: string;
      email: string;
      image_url: string;
    }[]>`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url
      FROM customers
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
      ORDER BY customers.name ASC
    `;

    const customers: FormattedCustomersTable[] = data.map((customer) => ({
      ...customer,
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
