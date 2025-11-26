'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { auth, signIn } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type { User } from '@/app/lib/definitions';
import { redirect } from 'next/navigation';
 
const sql = (() => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('Missing POSTGRES_URL environment variable');
  }
  return postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
})();
 
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
      redirect: false,
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (result?.error) {
      return 'Invalid credentials.';
    }

    if (result?.url) {
      redirect(result.url);
    }

    redirect(redirectTo);
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

  // Optional metadata inserts; ignore errors if tables don't exist yet.
  try {
    await sql`
      INSERT INTO companies (
        id,
        name,
        contact_email,
        headcount,
        region,
        plan,
        billing_mode,
        seat_limit,
        vat_number,
        registration_id,
        billing_address,
        industry,
        created_at
      )
      VALUES (
        ${companyId},
        ${companyName},
        ${personalEmail},
        ${headcount},
        ${region},
        ${plan},
        ${rule.billingMode},
        ${rule.seatLimit},
        ${vatNumber},
        ${registrationId},
        ${billingAddress},
        ${industry},
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
  salaryMonthly: z.coerce.number().min(0, 'Salary must be positive'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

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

export async function createEmployee(prevState: EmployeeState = defaultEmployeeState, formData: FormData) {
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
      salaryMonthly: formData.get('salaryMonthly'),
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
      salaryMonthly,
      password,
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

    const salaryCents = Math.round((salaryMonthly ?? 0) * 100);

    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        company_id UUID REFERENCES companies(id),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        contract_type TEXT,
        hours_per_week INT,
        role TEXT,
        departments TEXT[],
        skills TEXT[],
        salary_cents INT,
        user_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id UUID`;

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
        user_id
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
        ${linkedUserId}
      )
    `;

    // Keep headcount roughly in sync.
    await sql`UPDATE companies SET headcount = COALESCE(headcount, 0) + 1 WHERE id = ${companyId}`;

    return { status: 'success', message: 'Employee created.' };
  } catch (error) {
    console.error('Create employee failed:', error);
    return { status: 'error', message: 'Employee could not be created.' };
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

const PlanningTimeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  startDay: z.string().optional(),
  endDay: z.string().optional(),
  hoursText: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  notes: z.string().optional(),
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
) {
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

    const { name, startDay, endDay, hoursText, startTime, endTime, notes, isDefault } = parsed.data;

    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
      CREATE TABLE IF NOT EXISTS planning_times (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        company_id UUID REFERENCES companies(id),
        name TEXT NOT NULL,
        start_day TEXT,
        end_day TEXT,
        hours_text TEXT,
        start_time TEXT,
        end_time TEXT,
        notes TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    if (isDefault) {
      await sql`UPDATE planning_times SET is_default = FALSE WHERE company_id = ${companyId}`;
    }

    await sql`
      INSERT INTO planning_times (company_id, name, start_day, end_day, hours_text, start_time, end_time, notes, is_default)
      VALUES (${companyId}, ${name}, ${startDay ?? null}, ${endDay ?? null}, ${hoursText ?? null}, ${startTime ?? null}, ${endTime ?? null}, ${notes ?? null}, ${!!isDefault})
    `;

    return { status: 'success', message: 'Planning time created.' };
  } catch (error) {
    console.error('Create planning time failed:', error);
    return { status: 'error', message: 'Planning time could not be created.' };
  }
}

export async function setPlanningTimeDefault(prevState: PlanningTimeState = defaultPlanningTimeState, formData: FormData) {
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

    await sql.begin(async (trx) => {
      await trx`UPDATE planning_times SET is_default = FALSE WHERE company_id = ${companyId}`;
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
