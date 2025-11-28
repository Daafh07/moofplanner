import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import {
  fetchLocationsByUser,
  fetchPlanningTimesByUser,
  fetchEmployeesByUser,
  fetchDepartmentsByUser,
} from '@/app/lib/data';
import PlannerLocationClient from './client';

export const metadata: Metadata = {
  title: 'Planner · Location',
};

export default async function PlannerLocationPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const userId = (session.user as { id?: string } | undefined)?.id;
  const [locations, planning, employees, departments] = await Promise.all([
    userId ? fetchLocationsByUser(userId) : [],
    userId ? fetchPlanningTimesByUser(userId) : [],
    userId ? fetchEmployeesByUser(userId) : [],
    userId ? fetchDepartmentsByUser(userId) : [],
  ]);
  const location = locations.find((l) => l.id === resolvedParams.locationId);
  if (!location) {
    redirect('/dashboard/planner');
  }
  const plans = planning.filter((p) => p.location_id === location.id);

  return (
    <PlannerLocationClient
      location={location}
      plans={plans}
      employees={employees}
      departments={departments}
    />
  );
}
