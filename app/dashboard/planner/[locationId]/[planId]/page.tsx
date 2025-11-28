import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { fetchPlanningTimesByUser, fetchLocationsByUser, fetchEmployeesByUser, fetchDepartmentsByUser } from '@/app/lib/data';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';

function parseSchedule(hoursText: string | null) {
  try {
    const parsed = hoursText ? JSON.parse(hoursText) : [];
    if (Array.isArray(parsed)) return parsed as { day: string; start?: string; end?: string; closed?: boolean }[];
    return [];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Planner · Board',
};

export default async function PlannerBoardPage({
  params,
}: {
  params: { locationId: string; planId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const userId = (session.user as { id?: string } | undefined)?.id;
  const [locations, planning, employees, departments] = await Promise.all([
    userId ? fetchLocationsByUser(userId) : [],
    userId ? fetchPlanningTimesByUser(userId) : [],
    userId ? fetchEmployeesByUser(userId) : [],
    userId ? fetchDepartmentsByUser(userId) : [],
  ]);

  const location = locations.find((l) => l.id === params.locationId);
  const plan = planning.find((p) => p.id === params.planId && p.location_id === params.locationId);
  if (!location || !plan) {
    redirect('/dashboard/planner');
  }

  const schedule = parseSchedule(plan.hours_text);
  const locationEmployees = employees.filter((e) => e.location_id === location.id);

  // Determine time range
  const parseHour = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h + (m || 0) / 60;
  };
  const dayRanges = schedule.map((s) => {
    if (s.closed) return { day: s.day, closed: true, start: null, end: null };
    const start = s.start ? parseHour(s.start) : null;
    const end = s.end ? parseHour(s.end) : null;
    return { day: s.day, closed: false, start, end };
  });
  const openTimes = dayRanges.filter((d) => !d.closed && d.start !== null && d.end !== null);
  const minHour =
    openTimes.length > 0 ? Math.min(...openTimes.map((d) => d.start as number)) : 8;
  const maxHour =
    openTimes.length > 0 ? Math.max(...openTimes.map((d) => d.end as number)) : 18;

  return (
    <main className="space-y-6 rounded-[40px] border border-white/10 bg-gradient-to-br from-[#1a2814]/90 via-[#0d140b]/95 to-[#050805] p-8 shadow-[0_40px_140px_rgba(5,10,5,0.65)] text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.5em] text-white/60`}>Planner</p>
          <h1 className={`${spaceGrotesk.className} text-3xl font-semibold`}>
            {location.name} · {plan.name}
          </h1>
          <p className="text-sm text-white/70">Drag departments into the available windows to build the roster.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 rounded-3xl border border-white/10 bg-black/25 p-4">
          <p className={`${plusJakarta.className} text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
            Employees (by department)
          </p>
          <div className="space-y-3">
            {departments.map((dept) => {
              const emps = locationEmployees.filter((e) => (e.departments ?? []).includes(dept.id));
              if (!emps.length) return null;
              return (
                <div key={dept.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className={`${spaceGrotesk.className} text-sm font-semibold text-white`}>{dept.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {emps.map((emp) => (
                      <span
                        key={emp.id}
                        className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/80"
                      >
                        {emp.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="rounded-3xl border border-white/10 bg-black/25 p-4">
          <div className="grid gap-3" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
            <div />
            {dayRanges.map((d) => (
              <div
                key={d.day}
                className={`${plusJakarta.className} text-[0.65rem] uppercase tracking-[0.25em] text-white/60`}
              >
                {d.day}
              </div>
            ))}
            {Array.from({ length: Math.ceil(maxHour - minHour) + 1 }).map((_, idx) => {
              const hour = Math.floor(minHour + idx);
              const label = `${hour.toString().padStart(2, '0')}:00`;
              return (
                <>
                  <div
                    key={`time-${label}`}
                    className={`${plusJakarta.className} text-[0.65rem] uppercase tracking-[0.25em] text-white/40`}
                  >
                    {label}
                  </div>
                  {dayRanges.map((d) => {
                    const closedAllDay = d.closed || d.start === null || d.end === null;
                    const closedThisHour =
                      closedAllDay || hour < (d.start ?? 0) || hour >= (d.end ?? 24);
                    const showLabel = closedAllDay && hour === Math.floor(minHour);
                    return (
                      <div
                        key={`${d.day}-${label}`}
                        className={`relative h-10 rounded-lg border border-white/5 ${
                          closedThisHour ? 'bg-red-900/40' : 'bg-white/5'
                        }`}
                      >
                        {showLabel && (
                          <span className="absolute inset-0 flex items-center justify-center text-[0.7rem] text-red-300">
                            Closed
                          </span>
                        )}
                      </div>
                    );
                  })}
                </>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
