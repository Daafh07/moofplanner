'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { signIn } from '@/auth';
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
