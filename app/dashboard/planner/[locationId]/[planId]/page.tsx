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
import Link from 'next/link';
import { savePlannerDraft, publishPlannerDraft } from '@/app/lib/actions';

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

function startOfISOWeek(weekString: string | undefined) {
  if (!weekString) return null;
  const [yearPart, weekPart] = weekString.split('-W');
  const year = Number(yearPart);
  const week = Number(weekPart);
  if (!year || !week) return null;
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const day = simple.getUTCDay() || 7;
  const monday = new Date(simple);
  monday.setUTCDate(simple.getUTCDate() - day + 1);
  return monday;
}

function buildWeekDates(days: string[], weekString?: string) {
  const baseMonday = startOfISOWeek(weekString);
  const now = new Date();
  const monday = baseMonday ?? (() => {
    const day = now.getDay(); // 0 Sunday
    const diff = day === 0 ? -6 : 1 - day;
    const first = new Date(now);
    first.setDate(now.getDate() + diff);
    return first;
  })();
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

function formatWeekRangeLabel(weekDates: string[]) {
  if (!weekDates.length) return '';
  try {
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    const start = formatter.format(new Date(weekDates[0]));
    const end = formatter.format(new Date(weekDates[weekDates.length - 1]));
    return `${start} – ${end}`;
  } catch {
    return '';
  }
}

export const metadata: Metadata = {
  title: 'Planner · Board',
};

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PlannerBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locationId: string; planId: string }>;
  searchParams: Promise<{ week?: string; readOnly?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const readOnly = resolvedSearch.readOnly === '1' || resolvedSearch.readOnly === 'true';
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
  const locationEmployees = employees.filter((e) => {
    const list = e.location_ids ?? [];
    return e.location_id === location.id || list.includes(location.id);
  });
  const dayRanges = schedule.map((s) => ({
    day: s.day,
    start: s.start ?? '',
    end: s.end ?? '',
    closed: !!s.closed || !s.start || !s.end,
    range: s.start && s.end ? `${s.start} – ${s.end}` : 'Closed',
  }));
  
  const dayLabels = dayRanges.map((d) => d.day);
  const weekDates = buildWeekDates(dayLabels, resolvedSearch.week);
  
  const deptEmployees = departments
    .map((dept) => ({
      dept,
      emps: locationEmployees
        .filter((e) => (e.departments ?? []).includes(dept.id))
        .map((e) => ({
          id: e.id,
          name: e.name,
          hours_per_week: e.hours_per_week ?? 0,
        })),
    }))
    .filter((d) => d.emps.length > 0);

  const weekRangeLabel = formatWeekRangeLabel(weekDates);
  const pillClass =
    'min-w-[180px] rounded-full border border-white/30 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-white/85 transition hover:border-white hover:text-white text-center';
  const primaryPillClass =
    'min-w-[180px] rounded-full border border-white bg-white px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[#0d140b] transition hover:border-[#d2ff00] hover:bg-[#d2ff00] hover:text-[#0d140b] text-center';

  return (
    <main className="space-y-8 rounded-[40px] border border-white/10 bg-gradient-to-br from-[#1a2814]/90 via-[#0d140b]/95 to-[#050805] p-8 shadow-[0_40px_140px_rgba(5,10,5,0.65)] text-white">
      <header className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-black/20 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.5em] text-white/60`}>Planner</p>
          <h1 className={`${spaceGrotesk.className} text-3xl font-semibold`}>{location.name}</h1>
          <p className="text-sm text-white/70">
            {plan.name}
            {weekRangeLabel ? ` · Week ${weekRangeLabel}` : ''}
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/planner"
              className={pillClass}
            >
              All locations
            </Link>
            <Link
              href={`/dashboard/planner/${location.id}`}
              className={pillClass}
            >
              Change plan
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className={`${plusJakarta.className} text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
              Shift board
            </p>
            <h2 className={`${spaceGrotesk.className} text-xl font-semibold text-white`}>
              {weekRangeLabel ? `Week ${weekRangeLabel}` : 'Current week'}
            </h2>
            <p className="text-sm text-white/60">Manage shifts per employee for this planning block.</p>
          </div>
          <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
            {deptEmployees.length} departments · {locationEmployees.length} employees
          </div>
        </div>

        <PlannerBoardClient
          dayRanges={dayRanges}
          weekDates={weekDates}
          deptEmployees={deptEmployees}
          shifts={shifts}
          planId={plan.id}
          locationId={location.id}
          readOnly={readOnly}
        />
      </section>

      {!readOnly && (
      <form className="flex flex-wrap justify-end gap-2">
        <input type="hidden" name="planningId" value={plan.id} />
        <input type="hidden" name="locationId" value={location.id} />
        <input type="hidden" name="week" value={resolvedSearch.week ?? ''} />
        <input type="hidden" name="path" value={`/dashboard/planner/${location.id}/${plan.id}${resolvedSearch.week ? `?week=${encodeURIComponent(resolvedSearch.week)}` : ''}`} />
        <button
          type="submit"
          formAction={async (formData) => {
            'use server';
            await savePlannerDraft(formData);
            redirect('/dashboard/planner');
          }}
          className={primaryPillClass}
        >
          Save
        </button>
        <button
          formAction={async (formData) => {
            'use server';
            await publishPlannerDraft(formData);
            redirect('/dashboard/planner');
          }}
          type="submit"
          className={primaryPillClass}
        >
          Publish
        </button>
      </form>
      )}
    </main>
  );
}
