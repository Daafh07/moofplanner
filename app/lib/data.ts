import { Revenue, Employee, Department, PlanningTime, AdminUser, Location, PlanningDraft } from './definitions';
import { formatCurrency } from './utils';
import sql from './db';

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
      SELECT
        c.id,
        c.name,
        c.plan,
        COALESCE(emp.count, 0) AS headcount,
        c.region,
        c.seat_limit,
        c.billing_mode
      FROM companies c
      JOIN company_admins ca ON ca.company_id = c.id
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS count
        FROM employees e
        WHERE e.company_id = c.id
      ) emp ON TRUE
      WHERE ca.user_id = ${userId}
      ORDER BY c.created_at DESC
      LIMIT 1
    `;
  } else {
    result = await sql<CompanySnapshot[]>`
      SELECT
        c.id,
        c.name,
        c.plan,
        COALESCE(emp.count, 0) AS headcount,
        c.region,
        c.seat_limit,
        c.billing_mode
      FROM companies c
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS count
        FROM employees e
        WHERE e.company_id = c.id
      ) emp ON TRUE
      ORDER BY created_at DESC
      LIMIT 1
    `;
  }
  return result[0] ?? null;
}

export async function fetchDashboardMetrics(userId?: string) {
  // Scope metrics to the signed-in user's company so counts match their dashboard.
  const metrics = await sql<{ headcount: number | null }[]>`
    SELECT COALESCE(emp.count, 0) AS headcount
    FROM companies c
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS count
      FROM employees e
      WHERE e.company_id = c.id
    ) emp ON TRUE
    WHERE c.id = (
      SELECT company_id FROM company_admins WHERE user_id = ${userId ?? null} LIMIT 1
    )
    LIMIT 1
  `;
  const headcount = metrics[0]?.headcount ?? 0;

  const scheduledHours = Number(headcount ?? 0) * 38;

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
  // If the events table does not exist, return an empty list without failing.
  try {
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
  } catch (err) {
    console.warn('events table missing or unreadable, returning empty events list');
    return [];
  }
}

export async function fetchOrganizationCards(userId?: string) {
  try {
    if (userId) {
      return await sql<{ name: string; email: string; role: string | null }[]>`
        SELECT u.name, u.email, ca.role
        FROM company_admins ca
        JOIN users u ON ca.user_id = u.id
        WHERE ca.company_id = (
          SELECT company_id FROM company_admins WHERE user_id = ${userId} LIMIT 1
        )
        LIMIT 4
      `;
    }
    return await sql<{ name: string; email: string; role: string | null }[]>`
      SELECT u.name, u.email, ca.role
      FROM company_admins ca
      JOIN users u ON ca.user_id = u.id
      LIMIT 4
    `;
  } catch (err) {
    console.error('fetchOrganizationCards failed', err);
    return [];
  }
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
  return {};
}

export async function fetchEmployeesByUser(userId: string) {
  try {
    const employees = await sql<Employee[]>`
      SELECT e.*
      FROM employees e
      WHERE e.company_id = (
        SELECT company_id FROM company_admins WHERE user_id = ${userId} LIMIT 1
      )
      ORDER BY e.created_at DESC
    `;
    return employees;
  } catch (err) {
    console.error('Database Error:', err);
    return [];
  }
}

export async function fetchDepartmentsByUser(userId: string) {
  try {
    const departments = await sql<Department[]>`
      WITH company_scope AS (
        SELECT company_id FROM company_admins WHERE user_id = ${userId} LIMIT 1
      )
      SELECT
        d.*,
        COALESCE(stats.members_count, 0) AS members_count,
        COALESCE(stats.hourly_cost, 0)   AS hourly_cost,
        COALESCE(pt.count, 0)            AS schedules_count
      FROM departments d
      JOIN company_scope cs ON d.company_id = cs.company_id
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*)::int AS members_count,
          COALESCE(SUM(e.salary_cents), 0)::float / 100.0 AS hourly_cost
        FROM employees e
        WHERE e.company_id = d.company_id
          AND e.departments IS NOT NULL
          AND d.id::text = ANY(e.departments)
      ) stats ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS count
        FROM planning_times p
        WHERE p.company_id = d.company_id
      ) pt ON TRUE
      ORDER BY d.created_at DESC
    `;
    return departments;
  } catch (err) {
    console.error('Database Error:', err);
    return [];
  }
}

export async function fetchPlanningTimesByUser(userId: string) {
  try {
    const items = await sql<PlanningTime[]>`
      SELECT p.*, l.name AS location_name
      FROM planning_times p
      LEFT JOIN locations l ON p.location_id = l.id
      WHERE p.company_id = (
        SELECT company_id FROM company_admins WHERE user_id = ${userId} LIMIT 1
      )
      ORDER BY COALESCE(p.is_default, false) DESC, p.created_at DESC
    `;
    return items;
  } catch (err) {
    console.error('Database Error:', err);
    return [];
  }
}

export type Shift = {
  id: string;
  company_id: string;
  location_id: string;
  planning_id: string;
  employee_id: string;
  department_id: string | null;
  date: string; // ISO date
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  notes: string | null;
  created_at: string;
};

export async function fetchShiftsByPlanning(planningId?: string) {
  if (!planningId) return [];
  try {
    const rows = await sql<Shift[]>`
      SELECT *
      FROM shifts
      WHERE planning_id = ${planningId}
      ORDER BY date ASC, start_time ASC
    `;
    return rows;
  } catch (err) {
    console.error('Database Error: fetchShiftsByPlanning failed', err);
    return [];
  }
}

export async function fetchShiftsByDraft(draftId: string) {
  if (!draftId) return [];
  try {
    const rows = await sql<Shift[]>`
      SELECT *
      FROM shifts
      WHERE draft_id = ${draftId}
      ORDER BY date ASC, start_time ASC
    `;
    return rows;
  } catch (err) {
    console.error('Database Error: fetchShiftsByDraft failed', err);
    return [];
  }
}

// Keep the old function for backward compatibility
// export async function fetchShiftsByPlanning(planningId?: string) {
//   if (!planningId) return [];
//   try {
//     const rows = await sql<Shift[]>`
//       SELECT *
//       FROM shifts
//       WHERE planning_id = ${planningId}
//       ORDER BY date ASC, start_time ASC
//     `;
//     return rows;
//   } catch (err) {
//     console.error('Database Error: fetchShiftsByPlanning failed', err);
//     return [];
//   }
// }

export async function fetchAdminsByUser(userId: string) {
  try {
    const admins = await sql<AdminUser[]>`
      SELECT ca.company_id, ca.role, ca.created_at, u.id as user_id, u.name, u.email
      FROM company_admins ca
      JOIN users u ON ca.user_id = u.id
      WHERE ca.company_id = (
        SELECT company_id FROM company_admins WHERE user_id = ${userId} LIMIT 1
      )
      ORDER BY ca.created_at DESC
    `;
    return admins;
  } catch (err) {
    console.error('Database Error:', err);
    return [];
  }
}

export async function fetchDraftsByUser(userId: string) {
  try {
    const drafts = await sql<PlanningDraft[]>`
      WITH company_scope AS (
        SELECT company_id FROM company_admins WHERE user_id = ${userId} LIMIT 1
      )
      SELECT
        d.*,
        l.name AS location_name,
        p.name AS planning_name
      FROM planning_drafts d
      JOIN company_scope cs ON d.company_id = cs.company_id
      LEFT JOIN locations l ON l.id = d.location_id
      LEFT JOIN planning_times p ON p.id = d.planning_id
      WHERE d.status = 'draft'
      ORDER BY d.updated_at DESC, d.created_at DESC
    `;
    return drafts;
  } catch (err) {
    console.error('Database Error:', err);
    return [];
  }
}

export async function fetchPublishedDraftsByUser(userId: string) {
  try {
    const drafts = await sql<PlanningDraft[]>`
      WITH company_scope AS (
        SELECT company_id FROM company_admins WHERE user_id = ${userId} LIMIT 1
      )
      SELECT
        d.*,
        l.name AS location_name,
        p.name AS planning_name
      FROM planning_drafts d
      JOIN company_scope cs ON d.company_id = cs.company_id
      LEFT JOIN locations l ON l.id = d.location_id
      LEFT JOIN planning_times p ON p.id = d.planning_id
      WHERE d.status = 'published'
      ORDER BY d.week DESC NULLS LAST, d.updated_at DESC
    `;
    return drafts;
  } catch (err) {
    console.error('Database Error:', err);
    return [];
  }
}

export async function fetchLocationsByUser(userId: string) {
  try {
    const locations = await sql<Location[]>`
      SELECT l.*
      FROM locations l
      WHERE l.company_id = (SELECT company_id FROM company_admins WHERE user_id = ${userId} LIMIT 1)
      ORDER BY l.created_at DESC
    `;
    return locations;
  } catch (err) {
    console.error('Database Error:', err);
    return [];
  }
}
