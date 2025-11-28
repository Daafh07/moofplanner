// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Employee = {
  id: string;
  company_id: string;
  name: string;
  email: string;
  phone: string | null;
  contract_type: string | null;
  hours_per_week: number | null;
  role: string | null;
  departments: string[] | null;
  skills: string[] | null;
  salary_cents: number | null;
  user_id?: string | null;
};

export type Department = {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  roles?: number | null;
  members?: number | null;
  // Derived stats for detail view
  members_count?: number | null;
  schedules_count?: number | null;
  hourly_cost?: number | null;
};

export type PlanningTime = {
  id: string;
  company_id: string;
  name: string;
  start_day: string | null;
  end_day: string | null;
  hours_text: string | null;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  is_default: boolean | null;
};

export type AdminUser = {
  user_id: string;
  company_id: string;
  name: string;
  email: string;
  role: string | null;
  created_at: string;
};

export type Revenue = {
  month: string;
  revenue: number;
};
