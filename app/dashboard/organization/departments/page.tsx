import { Metadata } from 'next';
import DepartmentsClient from './client';
import { auth } from '@/auth';
import { fetchDepartmentsByUser } from '@/app/lib/data';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Departments · Organization',
};

export default async function DepartmentsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const userId = (session.user as { id?: string } | undefined)?.id;
  const departments = userId ? await fetchDepartmentsByUser(userId) : [];

  return (
    <main className="space-y-6 rounded-[40px] border border-white/10 bg-gradient-to-br from-[#0f1d14]/90 via-[#0b130d]/95 to-[#050805] p-8 shadow-[0_40px_140px_rgba(5,10,5,0.65)] text-white">
      <DepartmentsClient departments={departments} />
    </main>
  );
}
