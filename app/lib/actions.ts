'use server';

import { z } from 'zod';
import { auth, signIn } from '@/auth';
import { revalidatePath } from 'next/cache';
import { AuthError } from 'next-auth';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type { User } from '@/app/lib/definitions';
import { redirect } from 'next/navigation';
import sql from './db';
 
let shiftsEnsured = true; // schema should be created via migration; skip runtime DDL

const SignupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  plan: z.enum(['basic', 'next', 'enterprise'], { message: 'Choose a valid plan' }),
  companyName: z.string().min(2, 'Company name is required'),
  companyEmail: z.string().email('Company contact email required'),
  headcount: z.coerce.number().min(1, 'Headcount must be at least 1'),
  region: z.string().min(2, 'Headquarters location is required'),
  vatNumber: z.string().min(4, 'Official VAT/Tax number required'),
  registrationId: z.string().min(4, 'Chamber of Commerce / business ID required'),
  billingAddress: z.string().min(5, 'Billing address is required'),
  industry: z.string().min(2, 'Industry is required'),
});

const planRules = {
  basic: { seatLimit: 20, billingMode: 'company' as const },
  next: { seatLimit: 75, billingMode: 'per_user' as const },
  enterprise: { seatLimit: null as number | null, billingMode: 'enterprise' as const },
};

export type SignupState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const defaultSignupState: SignupState = { status: 'idle', message: undefined };

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const redirectToRaw = formData.get('redirectTo');
  const redirectTo =
    typeof redirectToRaw === 'string' && redirectToRaw.startsWith('/')
      ? redirectToRaw
      : '/dashboard';

  try {
    const result = await signIn('credentials', {
      redirectTo,
      redirect: true,
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // if (result?.error) {
    //   return 'Invalid credentials.';
    // }

    // if (result?.url) {
    //   redirect(result.url);
    // }

    // redirect(redirectTo);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function registerUser(
  prevState: SignupState = defaultSignupState,
  formData: FormData,
): Promise<SignupState> {
  const parsed = SignupSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    plan: formData.get('plan'),
    companyName: formData.get('companyName'),
    companyEmail: formData.get('companyEmail'),
    headcount: formData.get('headcount'),
    region: formData.get('region'),
    vatNumber: formData.get('vatNumber'),
    registrationId: formData.get('registrationId'),
    billingAddress: formData.get('billingAddress'),
    industry: formData.get('industry'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.errors[0]?.message ?? 'Invalid form input.',
    };
  }

  const {
    fullName,
    email,
    password,
    plan,
    companyName,
    companyEmail,
    headcount,
    region,
    vatNumber,
    registrationId,
    billingAddress,
    industry,
  } = parsed.data;

  const personalEmail = email.trim().toLowerCase();
  const loginEmail = companyEmail.trim().toLowerCase();

  const rule = planRules[plan];
  if (!rule) {
    return { status: 'error', message: 'Selected plan is not available.' };
  }

  if (rule.seatLimit !== null && headcount > rule.seatLimit) {
    return {
      status: 'error',
      message: `Headcount exceeds the ${plan === 'basic' ? 'Basic' : 'Next Step'} plan allowance (${rule.seatLimit} employees). Choose a different plan or reduce headcount.`,
    };
  }

  const existing = await sql<User[]>`SELECT id FROM users WHERE email=${loginEmail}`;
  if (existing.length > 0) {
    return { status: 'error', message: 'Email already registered.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = randomUUID();
  const companyId = randomUUID();

  try {
    await sql`
      INSERT INTO users (id, name, email, password)
      VALUES (${userId}, ${fullName}, ${loginEmail}, ${hashedPassword})
    `;
  } catch (error) {
    console.error(error);
    return { status: 'error', message: 'Failed to create account. Try again.' };
  }

  // Company + admin inserts aligned to current schema.
  try {
    await sql`
      INSERT INTO companies (
        id,
        name,
        region,
        plan,
        billing_mode,
        seat_limit,
        created_at
      )
      VALUES (
        ${companyId},
        ${companyName},
        ${region},
        ${plan},
        ${rule.billingMode},
        ${rule.seatLimit},
        NOW()
      )
    `;

    await sql`
      INSERT INTO company_admins (company_id, user_id, role, created_at)
      VALUES (${companyId}, ${userId}, 'owner', NOW())
    `;
  } catch (error) {
    console.warn('Company metadata insert skipped:', error);
  }

  return {
    status: 'success',
    message: 'Account created! You can sign in now.',
  };
}

async function ensureAuthenticated() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

const ContractTypes = [
  'Permanent contract',
  'Fixed-term contract',
  'On-call contract',
  'Zero-hours contract',
  'Min-max contract',
  'Temporary agency contract',
  'Secondment contract',
] as const;

const EmployeeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  contractType: z.enum(ContractTypes, { message: 'Contract type is required' }),
  hoursPerWeek: z.coerce.number().min(1, 'Hours per week are required'),
  role: z.string().min(2, 'Role is required'),
  departments: z.string().optional(), // comma separated
  skills: z.string().optional(), // comma separated
  salaryHourly: z.coerce.number().min(0, 'Salary must be positive'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  locationId: z.string().optional(),
  locationIds: z.string().optional(), // comma separated
});

async function ensureShiftsTable() {
  const g = global as unknown as { _shiftDeptEnsured?: boolean };
  if (g._shiftDeptEnsured) return;
  try {
    await sql`ALTER TABLE shifts ADD COLUMN IF NOT EXISTS department_id uuid`;
    g._shiftDeptEnsured = true;
  } catch (err) {
    console.error('ensureShiftsTable failed', err);
  }
}

async function ensureEmployeeLocationArray() {
  // Run once per process to avoid repeated ALTER warnings.
  if ((global as unknown as { _locArrayEnsured?: boolean })._locArrayEnsured) return;
  try {
    await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS location_ids text[]`;
    (global as unknown as { _locArrayEnsured?: boolean })._locArrayEnsured = true;
  } catch (err) {
    console.error('ensureEmployeeLocationArray failed', err);
  }
}

async function ensurePlannerDraftsTable() {
  const g = global as unknown as { _plannerDraftsEnsured?: boolean };
  if (g._plannerDraftsEnsured) return;
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
      CREATE TABLE IF NOT EXISTS planning_drafts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id uuid NOT NULL,
        location_id uuid NOT NULL,
        planning_id uuid NOT NULL,
        week text,
        status text NOT NULL DEFAULT 'draft',
        published_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_planning_drafts_company ON planning_drafts(company_id)`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_planning_drafts_unique ON planning_drafts(company_id, planning_id, week)`;
    await sql`ALTER TABLE planning_drafts ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'`;
    await sql`ALTER TABLE planning_drafts ADD COLUMN IF NOT EXISTS published_at timestamptz`;
    g._plannerDraftsEnsured = true;
  } catch (err) {
    console.error('ensurePlannerDraftsTable failed', err);
  }
}

const ShiftSchema = z.object({
  planningId: z.string().uuid(),
  locationId: z.string().uuid(),
  employeeId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  date: z.string().min(8),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  notes: z.string().optional(),
  breakMinutes: z.coerce.number().optional(),
});

type CreatedShift = {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number | null;
  notes: string | null;
  department_id: string | null;
};

// Update the createShift function to accept draftId
export async function createShift(formData: FormData): Promise<CreatedShift | null> {
  const session = await ensureAuthenticated();
  const userId = (session.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  const companyId = await getCompanyIdForUser(userId);
  if (!companyId) return null;
  const path = typeof formData.get('path') === 'string' ? (formData.get('path') as string) : '';

  const parsed = ShiftSchema.safeParse({
    planningId: formData.get('planningId'),
    locationId: formData.get('locationId'),
    employeeId: formData.get('employeeId'),
    departmentId: formData.get('departmentId'),
    date: formData.get('date'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    notes: formData.get('notes'),
    breakMinutes: formData.get('breakMinutes'),
  });
  
  if (!parsed.success) {
    console.error('Shift validation failed:', parsed.error);
    return null;
  }

  const { planningId, locationId, employeeId, departmentId, date, startTime, endTime, notes, breakMinutes } =
    parsed.data;
  
  if (endTime <= startTime) {
    console.error('End time must be after start time');
    return null;
  }

  try {
    await ensureShiftsTable();
    
    // Ensure date is in YYYY-MM-DD format
    const normalizedDate = date.includes('T') ? date.split('T')[0] : date;
    
    // Get the week from formData to find or create the draft
    const week = typeof formData.get('week') === 'string' ? (formData.get('week') as string) : null;
    
    // Find or create the draft for this planning/week combination
    await ensurePlannerDraftsTable();
    const draftResult = await sql<{ id: string }[]>`
      INSERT INTO planning_drafts (company_id, location_id, planning_id, week, status)
      VALUES (${companyId}, ${locationId}, ${planningId}, ${week}, 'draft')
      ON CONFLICT (company_id, planning_id, week)
      DO UPDATE SET updated_at = now()
      RETURNING id
    `;
    const draftId = draftResult[0]?.id;
    
    if (!draftId) {
      console.error('Failed to get draft_id');
      return null;
    }
    
    // Insert shift with draft_id
    const inserted = await sql<CreatedShift[]>`
      INSERT INTO shifts (company_id, location_id, planning_id, employee_id, department_id, date, start_time, end_time, break_minutes, notes, draft_id)
      VALUES (${companyId}, ${locationId}, ${planningId}, ${employeeId}, ${departmentId ?? null}, ${normalizedDate}, ${startTime}, ${endTime}, ${breakMinutes ?? 0}, ${notes ?? null}, ${draftId})
      RETURNING id, employee_id, department_id, date::text as date, start_time, end_time, break_minutes, notes
    `;
    
    if (path) revalidatePath(path);
    
    const result = inserted[0] ?? null;
    
    if (result) {
      console.log('Shift created:', result);
    }
    
    return result;
  } catch (err) {
    console.error('Create shift failed:', err);
    return null;
  }
}

// Update savePlannerDraft to NOT delete shifts
export async function savePlannerDraft(formData: FormData): Promise<DraftState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) return { status: 'error', message: 'Missing user.' };
    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) return { status: 'error', message: 'No company linked.' };

    const planningVal = formData.get('planningId');
    const locationVal = formData.get('locationId');
    const weekVal = formData.get('week');
    const pathVal = formData.get('path');

    const planningId = typeof planningVal === 'string' ? planningVal : '';
    const locationId = typeof locationVal === 'string' ? locationVal : '';
    const week = typeof weekVal === 'string' ? weekVal : null;
    const path = typeof pathVal === 'string' ? pathVal : '';
    if (!planningId || !locationId) {
      return { status: 'error', message: 'Missing planning or location.' };
    }

    await ensurePlannerDraftsTable();
    await sql`
      INSERT INTO planning_drafts (company_id, location_id, planning_id, week, status, published_at)
      VALUES (${companyId}, ${locationId}, ${planningId}, ${week}, 'draft', NULL)
      ON CONFLICT (company_id, planning_id, week)
      DO UPDATE SET status='draft', published_at=NULL, updated_at = now()
    `;
    revalidatePath('/dashboard/planner');
    if (path) revalidatePath(path);
    return { status: 'success', message: 'Draft saved.' };
  } catch (err) {
    console.error('Save draft failed', err);
    return { status: 'error', message: 'Could not save draft.' };
  }
}

// Update deletePlannerDraft to cascade delete shifts via draft_id
export async function deletePlannerDraft(formData: FormData): Promise<DraftState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) return { status: 'error', message: 'Missing user.' };
    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) return { status: 'error', message: 'No company linked.' };
    const id = String(formData.get('id') ?? '');
    if (!id) return { status: 'error', message: 'Missing draft id.' };

    await ensurePlannerDraftsTable();
    // The ON DELETE CASCADE on the foreign key will automatically delete associated shifts
    const res = await sql`
      DELETE FROM planning_drafts WHERE id=${id} AND company_id=${companyId}
      RETURNING id
    `;
    
    if (res.count === 0) {
      return { status: 'error', message: 'Draft not found.' };
    }
    revalidatePath('/dashboard/planner');
    return { status: 'success', message: 'Draft deleted.' };
  } catch (err) {
    console.error('Delete draft failed', err);
    return { status: 'error', message: 'Could not delete draft.' };
  }
}

// Update publishPlannerDraft
export async function publishPlannerDraft(formData: FormData): Promise<DraftState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) return { status: 'error', message: 'Missing user.' };
    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) return { status: 'error', message: 'No company linked.' };

    const planningVal = formData.get('planningId');
    const locationVal = formData.get('locationId');
    const weekVal = formData.get('week');
    const pathVal = formData.get('path');

    const planningId = typeof planningVal === 'string' ? planningVal : '';
    const locationId = typeof locationVal === 'string' ? locationVal : '';
    const week = typeof weekVal === 'string' ? weekVal : null;
    const path = typeof pathVal === 'string' ? pathVal : '';
    if (!planningId || !locationId) return { status: 'error', message: 'Missing planning or location.' };

    await ensurePlannerDraftsTable();
    await sql`
      INSERT INTO planning_drafts (company_id, location_id, planning_id, week, status, published_at)
      VALUES (${companyId}, ${locationId}, ${planningId}, ${week}, 'published', now())
      ON CONFLICT (company_id, planning_id, week)
      DO UPDATE SET status='published', published_at=now(), updated_at=now()
    `;
    revalidatePath('/dashboard/planner');
    if (path) revalidatePath(path);
    return { status: 'success', message: 'Published.' };
  } catch (err) {
    console.error('Publish draft failed', err);
    return { status: 'error', message: 'Could not publish.' };
  }
}

export type EmployeeState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const defaultEmployeeState: EmployeeState = { status: 'idle', message: undefined };

async function getCompanyIdForUser(userId: string) {
  const result = await sql<{ company_id: string }[]>`
    SELECT company_id FROM company_admins WHERE user_id = ${userId} LIMIT 1
  `;
  return result[0]?.company_id;
}

async function refreshHeadcount(companyId: string) {
  await sql`
    UPDATE companies
    SET headcount = (
      SELECT COUNT(*) FROM employees WHERE company_id = ${companyId}
    )
    WHERE id = ${companyId}
  `;
}

export async function createEmployee(
  prevState: EmployeeState = defaultEmployeeState,
  formData: FormData,
): Promise<EmployeeState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return { status: 'error', message: 'User id missing in session.' };
    }

    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) {
      return { status: 'error', message: 'No company linked to this user.' };
    }

    const parsed = EmployeeSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      contractType: formData.get('contractType'),
      hoursPerWeek: formData.get('hoursPerWeek'),
      role: formData.get('role'),
      departments: formData.get('departments'),
      skills: formData.get('skills'),
      salaryHourly: formData.get('salaryHourly'),
      password: (() => {
        const raw = formData.get('password');
        const val = typeof raw === 'string' ? raw.trim() : '';
        return val.length > 0 ? val : undefined;
      })(),
      locationIds: (() => {
        const raw = formData.get('locationIds');
        return typeof raw === 'string' ? raw : '';
      })(),
    });

    if (!parsed.success) {
      return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Invalid input.' };
    }

    const {
      name,
      email,
      phone,
      contractType,
      hoursPerWeek,
      role,
      departments,
      skills,
      salaryHourly,
      password,
      locationIds,
    } = parsed.data;

    const departmentList =
      departments
        ?.split(',')
        .map((d) => d.trim())
        .filter(Boolean) ?? [];
    const skillsList =
      skills
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? [];

    const salaryCents = Math.round((salaryHourly ?? 0) * 100);
    const locationList =
      locationIds
        ?.split(',')
        .map((id) => id.trim())
        .filter(Boolean) ?? [];
    const primaryLocation = locationList[0] ?? null;

    // Enforce seat limits before creating the employee.
    const companyPlan = await sql<{ seat_limit: number | null; plan: string | null }[]>`
      SELECT seat_limit, plan FROM companies WHERE id = ${companyId} LIMIT 1
    `;
    const seatLimit = companyPlan[0]?.seat_limit ?? null;

    const [{ count: employeeCountRaw }] = await sql<{ count: string }[]>`
      SELECT COUNT(*) FROM employees WHERE company_id = ${companyId}
    `;
    const employeeCount = Number(employeeCountRaw ?? '0');
    if (seatLimit !== null && employeeCount >= seatLimit) {
      return {
        status: 'error',
        message: `Seat limit reached for this plan (${seatLimit}). Remove users or upgrade the plan.`,
      };
    }

    await ensureEmployeeLocationArray();

    let linkedUserId: string | null = null;
    if (password) {
      const existingUser = await sql<User[]>`SELECT id FROM users WHERE email=${email.toLowerCase()} LIMIT 1`;
      linkedUserId = existingUser[0]?.id ?? null;
      if (!linkedUserId) {
        const hashedPassword = await bcrypt.hash(password, 10);
        linkedUserId = randomUUID();
        await sql`
          INSERT INTO users (id, name, email, password)
          VALUES (${linkedUserId}, ${name}, ${email.toLowerCase()}, ${hashedPassword})
        `;
      }
    }

    await sql`
      INSERT INTO employees (
        company_id,
        name,
        email,
        phone,
      contract_type,
      hours_per_week,
      role,
      departments,
      skills,
      salary_cents,
      user_id,
      location_id,
      location_ids
    )
    VALUES (
      ${companyId},
      ${name},
      ${email},
        ${phone ?? null},
        ${contractType},
        ${hoursPerWeek},
        ${role},
      ${departmentList},
      ${skillsList},
      ${salaryCents},
      ${linkedUserId},
      ${primaryLocation},
      ${locationList}
    )
    `;

    // Keep headcount in sync with current employee total.
    await refreshHeadcount(companyId);

    return { status: 'success', message: 'Employee created.' };
  } catch (error) {
    console.error('Create employee failed:', error);
    return { status: 'error', message: 'Employee could not be created.' };
  }
}

export async function updateEmployee(
  prevState: EmployeeState = defaultEmployeeState,
  formData: FormData,
): Promise<EmployeeState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) return { status: 'error', message: 'User id missing in session.' };

    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) return { status: 'error', message: 'No company linked to this user.' };

    const id = String(formData.get('id') ?? '');
    if (!id) return { status: 'error', message: 'Missing employee id.' };

    const parsed = EmployeeSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      contractType: formData.get('contractType'),
      hoursPerWeek: formData.get('hoursPerWeek'),
      role: formData.get('role'),
      departments: formData.get('departments'),
      skills: formData.get('skills'),
      salaryHourly: formData.get('salaryHourly'),
      password: (() => {
        const raw = formData.get('password');
        const val = typeof raw === 'string' ? raw.trim() : '';
        return val.length > 0 ? val : undefined;
      })(),
      locationIds: (() => {
        const raw = formData.get('locationIds');
        return typeof raw === 'string' ? raw : '';
      })(),
    });

    if (!parsed.success) {
      return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Invalid input.' };
    }

    const {
      name,
      email,
      phone,
      contractType,
      hoursPerWeek,
      role,
      departments,
      skills,
      salaryHourly,
      password,
      locationIds,
    } = parsed.data;
    const departmentList =
      departments
        ?.split(',')
        .map((d) => d.trim())
        .filter(Boolean) ?? [];
    const skillsList =
      skills
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? [];
    const salaryCents = Math.round((salaryHourly ?? 0) * 100);
    const locationList =
      locationIds
        ?.split(',')
        .map((id) => id.trim())
        .filter(Boolean) ?? [];
    const primaryLocation = locationList[0] ?? null;

    let linkedUserId: string | null = null;
    if (password) {
      const existingUser = await sql<User[]>`SELECT id FROM users WHERE email=${email.toLowerCase()} LIMIT 1`;
      linkedUserId = existingUser[0]?.id ?? null;
      if (!linkedUserId) {
        const hashedPassword = await bcrypt.hash(password, 10);
        linkedUserId = randomUUID();
        await sql`
          INSERT INTO users (id, name, email, password)
          VALUES (${linkedUserId}, ${name}, ${email.toLowerCase()}, ${hashedPassword})
        `;
      }
    }

    await ensureEmployeeLocationArray();

    const updated = await sql`
      UPDATE employees
      SET name=${name},
          email=${email},
          phone=${phone ?? null},
          contract_type=${contractType},
          hours_per_week=${hoursPerWeek},
          role=${role},
          departments=${departmentList},
          skills=${skillsList},
          salary_cents=${salaryCents},
          user_id=${linkedUserId ?? null},
          location_id=${primaryLocation},
          location_ids=${locationList}
      WHERE id=${id} AND company_id=${companyId}
      RETURNING id
    `;
    if (updated.count === 0) {
      return { status: 'error', message: 'Employee not found or not in your company.' };
    }
    return { status: 'success', message: 'Employee updated.' };
  } catch (error) {
    console.error('Update employee failed:', error);
    return { status: 'error', message: 'Employee could not be updated.' };
  }
}

export async function deleteEmployee(
  prevState: EmployeeState = defaultEmployeeState,
  formData: FormData,
): Promise<EmployeeState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) return { status: 'error', message: 'User id missing in session.' };

    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) return { status: 'error', message: 'No company linked to this user.' };

    const id = String(formData.get('id') ?? '');
    if (!id) return { status: 'error', message: 'Missing employee id.' };

    const res = await sql`DELETE FROM employees WHERE id=${id} AND company_id=${companyId}`;
    if (res.count > 0) {
      await refreshHeadcount(companyId);
      return { status: 'success', message: 'Employee deleted.' };
    }
    return { status: 'error', message: 'Employee not found or not in your company.' };
  } catch (error) {
    console.error('Delete employee failed:', error);
    return { status: 'error', message: 'Employee could not be deleted.' };
  }
}

const DepartmentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
});

export type DepartmentState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const defaultDepartmentState: DepartmentState = { status: 'idle', message: undefined };
// Locations share the same shape as a simple name/description table
const LocationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
});

export type LocationState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const defaultLocationState: LocationState = { status: 'idle', message: undefined };

export async function createDepartment(prevState: DepartmentState = defaultDepartmentState, formData: FormData) {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return { status: 'error', message: 'User id missing in session.' };
    }

    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) {
      return { status: 'error', message: 'No company linked to this user.' };
    }

    const parsed = DepartmentSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
    });

    if (!parsed.success) {
      return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Invalid input.' };
    }

    const { name, description } = parsed.data;

    await sql`
      INSERT INTO departments (company_id, name, description)
      VALUES (${companyId}, ${name}, ${description ?? null})
    `;

    return { status: 'success', message: 'Department created.' };
  } catch (error) {
    console.error('Create department failed:', error);
    return { status: 'error', message: 'Department could not be created.' };
  }
}

export async function updateDepartment(
  prevState: DepartmentState = defaultDepartmentState,
  formData: FormData,
): Promise<DepartmentState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) return { status: 'error', message: 'User id missing in session.' };
    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) return { status: 'error', message: 'No company linked to this user.' };

    const id = String(formData.get('id') ?? '');
    if (!id) return { status: 'error', message: 'Missing department id.' };

    const parsed = DepartmentSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
    });
    if (!parsed.success) {
      return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Invalid input.' };
    }
    const { name, description } = parsed.data;

    const res = await sql`
      UPDATE departments
      SET name=${name}, description=${description ?? null}
      WHERE id=${id} AND company_id=${companyId}
      RETURNING id
    `;
    if (res.count === 0) return { status: 'error', message: 'Department not found or not in your company.' };
    return { status: 'success', message: 'Department updated.' };
  } catch (error) {
    console.error('Update department failed:', error);
    return { status: 'error', message: 'Department could not be updated.' };
  }
}

export async function deleteDepartment(
  prevState: DepartmentState = defaultDepartmentState,
  formData: FormData,
): Promise<DepartmentState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) return { status: 'error', message: 'User id missing in session.' };
    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) return { status: 'error', message: 'No company linked to this user.' };

    const id = String(formData.get('id') ?? '');
    if (!id) return { status: 'error', message: 'Missing department id.' };

    const res = await sql.begin(async (trx) => {
      const del = await trx`DELETE FROM departments WHERE id=${id} AND company_id=${companyId}`;
      if (del.count === 0) return del;
      // Remove this department id from any employees that reference it.
      await trx`
        UPDATE employees
        SET departments = array_remove(departments, ${id})
        WHERE company_id = ${companyId} AND departments @> ARRAY[${id}]::text[]
      `;
      return del;
    });
    if (res.count === 0) return { status: 'error', message: 'Department not found or not in your company.' };
    return { status: 'success', message: 'Department deleted.' };
  } catch (error) {
    console.error('Delete department failed:', error);
    return { status: 'error', message: 'Department could not be deleted.' };
  }
}

export async function createLocation(
  prevState: LocationState = defaultLocationState,
  formData: FormData,
): Promise<LocationState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) return { status: 'error', message: 'User id missing in session.' };
    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) return { status: 'error', message: 'No company linked to this user.' };

    const parsed = LocationSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
    });
    if (!parsed.success) {
      return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Invalid input.' };
    }

    const { name, description } = parsed.data;

    await sql`
      INSERT INTO locations (company_id, name, description)
      VALUES (${companyId}, ${name}, ${description ?? null})
    `;
    return { status: 'success', message: 'Location created.' };
  } catch (error) {
    console.error('Create location failed:', error);
    return { status: 'error', message: 'Location could not be created.' };
  }
}

export async function deleteLocation(
  prevState: LocationState = defaultLocationState,
  formData: FormData,
): Promise<LocationState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) return { status: 'error', message: 'User id missing in session.' };
    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) return { status: 'error', message: 'No company linked to this user.' };

    const id = String(formData.get('id') ?? '');
    if (!id) return { status: 'error', message: 'Missing location id.' };

    const res = await sql`DELETE FROM locations WHERE id=${id} AND company_id=${companyId}`;
    if (res.count === 0) return { status: 'error', message: 'Location not found or not in your company.' };
    // Detach from planning_times
    await sql`UPDATE planning_times SET location_id = NULL WHERE location_id = ${id} AND company_id = ${companyId}`;
    return { status: 'success', message: 'Location deleted.' };
  } catch (error) {
    console.error('Delete location failed:', error);
    return { status: 'error', message: 'Location could not be deleted.' };
  }
}

const PlanningTimeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  locationId: z.coerce.string().min(1, 'Location is required'),
  location: z.string().nullish(),
  startDay: z.string().nullish(),
  endDay: z.string().nullish(),
  hoursText: z.string().nullish(),
  startTime: z.string().nullish(),
  endTime: z.string().nullish(),
  notes: z.string().nullish(),
  isDefault: z.coerce.boolean().optional(),
});

export type PlanningTimeState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const defaultPlanningTimeState: PlanningTimeState = { status: 'idle', message: undefined };

export async function createPlanningTime(
  prevState: PlanningTimeState = defaultPlanningTimeState,
  formData: FormData,
): Promise<PlanningTimeState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return { status: 'error', message: 'User id missing in session.' };
    }

    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) {
      return { status: 'error', message: 'No company linked to this user.' };
    }

    const parsed = PlanningTimeSchema.safeParse({
      name: formData.get('name'),
      locationId: (() => {
        const raw = formData.get('locationId');
        const val = typeof raw === 'string' ? raw.trim() : '';
        return val.length ? val : undefined;
      })(),
      location: formData.get('location'),
      startDay: formData.get('startDay'),
      endDay: formData.get('endDay'),
      hoursText: formData.get('hoursText'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      notes: formData.get('notes'),
      isDefault: formData.get('isDefault'),
    });

    if (!parsed.success) {
      return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Invalid input.' };
    }

    const { name, locationId, location, startDay, endDay, hoursText, startTime, endTime, notes, isDefault } =
      parsed.data;
    // Normalize weekly schedule JSON
    const scheduleJson = typeof hoursText === 'string' && hoursText.trim().length > 0 ? hoursText.trim() : null;
    let computedStartDay = startDay ?? null;
    let computedEndDay = endDay ?? null;
    if (scheduleJson) {
      try {
        const parsedSchedule = JSON.parse(scheduleJson);
        if (Array.isArray(parsedSchedule)) {
          const activeDays = parsedSchedule.filter(
            (d: any) => d && !d.closed && typeof d.day === 'string' && (d.start || d.end),
          );
          if (activeDays.length > 0) {
            computedStartDay = activeDays[0].day ?? computedStartDay;
            computedEndDay = activeDays[activeDays.length - 1].day ?? computedEndDay;
          }
        }
      } catch {
        // keep defaults
      }
    }

    if (isDefault && locationId) {
      await sql`
        UPDATE planning_times
        SET is_default = FALSE
        WHERE company_id = ${companyId} AND location_id = ${locationId}
      `;
    }

    await sql`
      INSERT INTO planning_times (company_id, name, location, location_id, start_day, end_day, hours_text, start_time, end_time, notes, is_default)
      VALUES (${companyId}, ${name}, ${location ?? null}, ${locationId ?? null}, ${computedStartDay}, ${computedEndDay}, ${scheduleJson}, ${startTime ?? null}, ${endTime ?? null}, ${notes ?? null}, ${!!isDefault})
    `;

    return { status: 'success', message: 'Planning time created.' };
  } catch (error) {
    console.error('Create planning time failed:', error);
    return { status: 'error', message: 'Planning time could not be created.' };
  }
}

export async function updatePlanningTime(
  prevState: PlanningTimeState = defaultPlanningTimeState,
  formData: FormData,
): Promise<PlanningTimeState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) return { status: 'error', message: 'User id missing in session.' };

    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) return { status: 'error', message: 'No company linked to this user.' };

    const id = String(formData.get('id') ?? '');
    if (!id) return { status: 'error', message: 'Missing planning id.' };

    const parsed = PlanningTimeSchema.safeParse({
      name: formData.get('name'),
      locationId: (() => {
        const raw = formData.get('locationId');
        const val = typeof raw === 'string' ? raw.trim() : '';
        return val.length ? val : undefined;
      })(),
      location: formData.get('location'),
      startDay: formData.get('startDay'),
      endDay: formData.get('endDay'),
      hoursText: formData.get('hoursText'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      notes: formData.get('notes'),
      isDefault: formData.get('isDefault'),
    });
    if (!parsed.success) {
      return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Invalid input.' };
    }
    const { name, locationId, location, startDay, endDay, hoursText, startTime, endTime, notes, isDefault } =
      parsed.data;
    const scheduleJson = typeof hoursText === 'string' && hoursText.trim().length > 0 ? hoursText.trim() : null;
    let computedStartDay = startDay ?? null;
    let computedEndDay = endDay ?? null;
    if (scheduleJson) {
      try {
        const parsedSchedule = JSON.parse(scheduleJson);
        if (Array.isArray(parsedSchedule)) {
          const activeDays = parsedSchedule.filter(
            (d: any) => d && !d.closed && typeof d.day === 'string' && (d.start || d.end),
          );
          if (activeDays.length > 0) {
            computedStartDay = activeDays[0].day ?? computedStartDay;
            computedEndDay = activeDays[activeDays.length - 1].day ?? computedEndDay;
          }
        }
      } catch {
        // ignore
      }
    }

    await sql.begin(async (trx) => {
      if (isDefault && locationId) {
        await trx`
          UPDATE planning_times
          SET is_default = FALSE
          WHERE company_id = ${companyId} AND location_id = ${locationId}
        `;
      }
      const updated = await trx`
        UPDATE planning_times
        SET name=${name},
            location=${location ?? null},
            location_id=${locationId ?? null},
            start_day=${computedStartDay},
            end_day=${computedEndDay},
            hours_text=${scheduleJson},
            start_time=${startTime ?? null},
            end_time=${endTime ?? null},
            notes=${notes ?? null},
            is_default=${!!isDefault}
        WHERE id=${id} AND company_id=${companyId}
        RETURNING id
      `;
      if (updated.count === 0) throw new Error('Planning not found');
    });

    return { status: 'success', message: 'Planning time updated.' };
  } catch (error) {
    console.error('Update planning time failed:', error);
    return { status: 'error', message: 'Planning time could not be updated.' };
  }
}

export async function deletePlanningTime(
  prevState: PlanningTimeState = defaultPlanningTimeState,
  formData: FormData,
): Promise<PlanningTimeState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) return { status: 'error', message: 'User id missing in session.' };
    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) return { status: 'error', message: 'No company linked to this user.' };

    const id = String(formData.get('id') ?? '');
    if (!id) return { status: 'error', message: 'Missing planning id.' };

    const res = await sql`DELETE FROM planning_times WHERE id=${id} AND company_id=${companyId}`;
    if (res.count === 0) return { status: 'error', message: 'Planning not found or not in your company.' };
    return { status: 'success', message: 'Planning time deleted.' };
  } catch (error) {
    console.error('Delete planning time failed:', error);
    return { status: 'error', message: 'Planning time could not be deleted.' };
  }
}

export async function setPlanningTimeDefault(
  prevState: PlanningTimeState = defaultPlanningTimeState,
  formData: FormData,
): Promise<PlanningTimeState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return { status: 'error', message: 'User id missing in session.' };
    }
    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) {
      return { status: 'error', message: 'No company linked to this user.' };
    }
    const planningId = String(formData.get('planningId') ?? '');
    if (!planningId) {
      return { status: 'error', message: 'Missing planning id.' };
    }

    const planning = await sql<{ location_id: string | null }[]>`
      SELECT location_id FROM planning_times WHERE id = ${planningId} AND company_id = ${companyId} LIMIT 1
    `;
    const locId = planning[0]?.location_id ?? null;

    await sql.begin(async (trx) => {
      if (locId) {
        await trx`
          UPDATE planning_times
          SET is_default = FALSE
          WHERE company_id = ${companyId} AND location_id = ${locId}
        `;
      }
      await trx`
        UPDATE planning_times
        SET is_default = TRUE
        WHERE id = ${planningId} AND company_id = ${companyId}
      `;
    });

    return { status: 'success', message: 'Default planning set.' };
  } catch (error) {
    console.error('Set default planning failed:', error);
    return { status: 'error', message: 'Could not set default planning.' };
  }
}

const AdminUserSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.string().optional(),
});

export type AdminUserState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const defaultAdminUserState: AdminUserState = { status: 'idle', message: undefined };

export async function createAdminUser(
  prevState: AdminUserState,
  formData: FormData,
): Promise<AdminUserState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return { status: 'error', message: 'User id missing in session.' };
    }

    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) {
      return { status: 'error', message: 'No company linked to this user.' };
    }

    const parsed = AdminUserSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
    });

    if (!parsed.success) {
      return { status: 'error', message: parsed.error.errors[0]?.message ?? 'Invalid input.' };
    }

    const { name, email, password, role } = parsed.data;
    const existing = await sql<User[]>`SELECT id FROM users WHERE email=${email.toLowerCase()}`;
    let newUserId = existing[0]?.id;

    if (!newUserId) {
      const hashedPassword = await bcrypt.hash(password, 10);
      newUserId = randomUUID();
      await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${newUserId}, ${name}, ${email.toLowerCase()}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    await sql`
      INSERT INTO company_admins (company_id, user_id, role, created_at)
      VALUES (${companyId}, ${newUserId}, ${role ?? 'admin'}, NOW())
      ON CONFLICT (company_id, user_id) DO NOTHING
    `;

    return { status: 'success', message: 'Admin user created and linked.' };
  } catch (error) {
    console.error('Create admin user failed:', error);
    return { status: 'error', message: 'Admin user could not be created.' };
  }
}

export async function deleteAdminUser(prevState: AdminUserState, formData: FormData): Promise<AdminUserState> {
  try {
    const session = await ensureAuthenticated();
    const userId = (session.user as { id?: string } | undefined)?.id;
    if (!userId) return { status: 'error', message: 'User id missing in session.' };
    const companyId = await getCompanyIdForUser(userId);
    if (!companyId) return { status: 'error', message: 'No company linked to this user.' };

    const targetUserId = String(formData.get('userId') ?? '');
    if (!targetUserId) return { status: 'error', message: 'Missing admin user id.' };

    const res = await sql`DELETE FROM company_admins WHERE company_id=${companyId} AND user_id=${targetUserId}`;
    if (res.count === 0) return { status: 'error', message: 'Admin not found for this company.' };

    return { status: 'success', message: 'Admin removed.' };
  } catch (error) {
    console.error('Delete admin failed:', error);
    return { status: 'error', message: 'Admin could not be removed.' };
  }
}
