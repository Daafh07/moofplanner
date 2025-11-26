import { Metadata } from 'next';
import PlanningTimeClient from './client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { fetchPlanningTimesByUser } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Planning Time · Organization',
};

export default async function PlanningTimePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const userId = (session.user as { id?: string } | undefined)?.id;
  const items = userId ? await fetchPlanningTimesByUser(userId) : [];

  return (
    <main className="space-y-6 rounded-[40px] border border-white/10 bg-gradient-to-br from-[#1a2814]/90 via-[#0d140b]/95 to-[#050805] p-8 shadow-[0_40px_140px_rgba(5,10,5,0.65)] text-white">
      <PlanningTimeClient items={items} />
    </main>
  );
}
