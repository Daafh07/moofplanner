import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import {
  fetchPlanningTimesByUser,
  fetchLocationsByUser,
  fetchEmployeesByUser,
  fetchDepartmentsByUser,
  fetchShiftsByPlanning,
  type Shift,
} from '@/app/lib/data';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import PlannerBoardClient from './board-client';

function parseSchedule(hoursText: string | null) {
  try {
    const parsed = hoursText ? JSON.parse(hoursText) : [];
    if (Array.isArray(parsed)) return parsed as { day: string; start?: string; end?: string; closed?: boolean }[];
    return [];
  } catch {
    return [];
  }
}

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function formatLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildWeekDates(days: string[]) {
  const now = new Date();
  // start of week Monday
  const day = now.getDay(); // 0 Sunday
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return days.map((label) => {
    const idx = dayOrder.findIndex((d) => d.toLowerCase() === label.toLowerCase());
    const date = new Date(monday);
    if (idx >= 0) date.setDate(monday.getDate() + idx);
    return formatLocal(date);
  });
}

function durationHours(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return Math.max(mins, 0) / 60;
}

export const metadata: Metadata = {
  title: 'Planner · Board',
};

export default async function PlannerBoardPage({
  params,
}: {
  params: Promise<{ locationId: string; planId: string }>;
}) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');
  const userId = (session.user as { id?: string } | undefined)?.id;
  const [locations, planning, employees, departments, shifts] = await Promise.all([
    userId ? fetchLocationsByUser(userId) : [],
    userId ? fetchPlanningTimesByUser(userId) : [],
    userId ? fetchEmployeesByUser(userId) : [],
    userId ? fetchDepartmentsByUser(userId) : [],
    userId ? fetchShiftsByPlanning(resolvedParams.planId) : [],
  ]);

  const location = locations.find((l) => l.id === resolvedParams.locationId);
  const plan = planning.find(
    (p) => p.id === resolvedParams.planId && p.location_id === resolvedParams.locationId,
  );
  if (!location || !plan) {
    redirect('/dashboard/planner');
  }

  const schedule = parseSchedule(plan.hours_text);
  const locationEmployees = employees.filter((e) => e.location_id === location.id);
  const dayRanges = schedule.map((s) => ({
    day: s.day,
    start: s.start ?? '',
    end: s.end ?? '',
    closed: !!s.closed || !s.start || !s.end,
    range: s.start && s.end ? `${s.start} – ${s.end}` : 'Closed',
  }));
  const dayLabels = dayRanges.map((d) => d.day);
  const weekDates = buildWeekDates(dayLabels);
  const deptEmployees = departments
    .map((dept) => ({
      dept,
      emps: locationEmployees
        .filter((e) => (e.departments ?? []).includes(dept.id))
        .map((e) => ({
          id: e.id,
          name: e.name,
          hours_per_week: e.hours_per_week ?? undefined,
        })),
    }))
    .filter((d) => d.emps.length > 0);

  return (
    <main className="space-y-6 rounded-[40px] border border-white/10 bg-gradient-to-br from-[#1a2814]/90 via-[#0d140b]/95 to-[#050805] p-8 shadow-[0_40px_140px_rgba(5,10,5,0.65)] text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.5em] text-white/60`}>Planner</p>
          <h1 className={`${spaceGrotesk.className} text-3xl font-semibold`}>
            {location.name} · {plan.name}
          </h1>
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-black/25 p-4">
        <PlannerBoardClient
          dayRanges={dayRanges}
          weekDates={weekDates}
          deptEmployees={deptEmployees}
          shifts={shifts}
          planId={plan.id}
          locationId={location.id}
        />
      </section>
    </main>
  );
}
