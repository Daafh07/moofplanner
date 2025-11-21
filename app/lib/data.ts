import postgres from 'postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
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
  const [{ sum }] = await sql<{ sum: number | null }[]>`
    SELECT COALESCE(SUM(amount), 0) AS sum FROM invoices WHERE date >= CURRENT_DATE - INTERVAL '7 days'
  `;
  const [{ count: pending }] = await sql<{ count: number | null }[]>`
    SELECT COUNT(*) FROM invoices WHERE status = 'pending'
  `;
  const [{ total_headcount }] = await sql<{ total_headcount: number | null }[]>`
    SELECT COALESCE(SUM(headcount), 0) AS total_headcount FROM companies
  `;

  const weeklyLaborCostCents = Number(sum ?? 0);
  const scheduledHours = Number(total_headcount ?? 0) * 38;
  const hourlyCostCents = scheduledHours > 0 ? weeklyLaborCostCents / scheduledHours : 0;

  return {
    weeklyLaborCost: formatCurrency(weeklyLaborCostCents),
    scheduledHours: `${scheduledHours.toLocaleString()} u`,
    hourlyCost: formatCurrency(hourlyCostCents),
    openTasks: Number(pending ?? 0),
  };
}

export async function fetchPendingApprovals() {
  const data = await sql<{
    id: string;
    customer_id: string;
    amount: number;
    status: string;
    date: string;
    customer_name: string;
  }[]>`
    SELECT invoices.id,
           invoices.customer_id,
           invoices.amount,
           invoices.status,
           invoices.date,
           customers.name AS customer_name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.status = 'pending'
    ORDER BY invoices.date ASC
    LIMIT 4
  `;

  return data.map((item) => ({
    id: item.id,
    title: item.customer_name,
    detail: `${new Date(item.date).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' })}`,
    amount: formatCurrency(item.amount ?? 0),
  }));
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
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)
      await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  // force 3s delay so Suspense fallbacks (skeletons) are visible
  await new Promise((r) => setTimeout(r, 3000));

  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  // force 3s delay so Suspense fallbacks (skeletons) are visible
  await new Promise((r) => setTimeout(r, 3000));

  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? '0');
    const numberOfCustomers = Number(data[1][0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
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
    const data = await sql<CustomersTableType[]>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
