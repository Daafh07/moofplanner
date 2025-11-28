import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { fetchLocationsByUser, fetchPlanningTimesByUser } from '@/app/lib/data';
import PlannerLocationClient from './client';

export const metadata: Metadata = {
  title: 'Planner · Location',
};

export default async function PlannerLocationPage({ params }: { params: { locationId: string } }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const userId = (session.user as { id?: string } | undefined)?.id;
  const [locations, planning] = await Promise.all([
    userId ? fetchLocationsByUser(userId) : [],
    userId ? fetchPlanningTimesByUser(userId) : [],
  ]);
  const location = locations.find((l) => l.id === params.locationId);
  if (!location) {
    redirect('/dashboard/planner');
  }
  const plans = planning.filter((p) => p.location_id === location.id);

  return <PlannerLocationClient location={location} plans={plans} />;
}
