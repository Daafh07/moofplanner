'use client';

import { useMemo, useState } from 'react';
import type { PlanningTime, Employee, Department } from '@/app/lib/definitions';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import Link from 'next/link';

type LocationData = { id: string; name: string; description: string | null };

function parseSchedule(hoursText: string | null) {
  try {
    const parsed = hoursText ? JSON.parse(hoursText) : [];
    if (Array.isArray(parsed)) return parsed as { day: string; start?: string; end?: string; closed?: boolean }[];
    return [];
  } catch {
    return [];
  }
}

export default function PlannerLocationClient({
  location,
  plans,
  employees,
  departments,
  selectedWeek,
}: {
  location: LocationData;
  plans: PlanningTime[];
  employees: Employee[];
  departments: Department[];
  selectedWeek?: string;
}) {
  const defaultPlan = useMemo(() => plans.find((p) => p.is_default) ?? plans[0], [plans]);
  const [selectedId, setSelectedId] = useState(defaultPlan?.id ?? plans[0]?.id ?? null);
  const selected = plans.find((p) => p.id === selectedId) ?? defaultPlan ?? null;
  const schedule = selected ? parseSchedule(selected.hours_text) : [];
  const locationEmployees = employees.filter((e) => {
    const list = e.location_ids ?? [];
    return e.location_id === location.id || list.includes(location.id);
  });
  const departmentMap = useMemo(() => Object.fromEntries(departments.map((d) => [d.id, d.name])), [departments]);
  const weekParam = selectedWeek ?? '';

  return (
    <main className="space-y-8 rounded-[40px] border border-white/10 bg-gradient-to-br from-[#1a2814]/90 via-[#0d140b]/95 to-[#050805] p-8 shadow-[0_40px_140px_rgba(5,10,5,0.65)] text-white">
      <header className="flex flex-col gap-2 rounded-[28px] border border-white/10 bg-black/20 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.5em] text-white/60`}>Planner</p>
          <h1 className={`${spaceGrotesk.className} text-3xl font-semibold`}>{location.name}</h1>
          {location.description && <p className="text-sm text-white/70">{location.description}</p>}
          {weekParam && <p className="text-xs text-white/60">Week: {weekParam}</p>}
        </div>
        <Link
          href="/dashboard/planner"
          className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-[#d2ff00] hover:text-white"
        >
          Back to locations
        </Link>
      </header>

      {!plans.length ? (
        <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
          No planning blocks for this location yet.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`${plusJakarta.className} text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
                  Select planning block
                </p>
                <h3 className={`${spaceGrotesk.className} text-2xl font-semibold`}>
                  {selected ? selected.name : 'Choose planning'}
                </h3>
              </div>
              <span className="text-xs text-white/60">{plans.length} available</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {plans.map((p) => {
                const isActive = selected?.id === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                      isActive
                        ? 'border-[#d2ff00] bg-[#d2ff00]/10 text-[#d2ff00]'
                        : 'border-white/10 bg-black/20 text-white/80 hover:border-[#d2ff00] hover:text-white'
                    }`}
                    title={p.is_default ? 'Default planning block' : 'Planning block'}
                  >
                    {p.name} {p.is_default ? '(default)' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {selected && (
            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${plusJakarta.className} text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
                    Schedule
                  </p>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-semibold`}>{selected.name}</h3>
                  {selected.notes && <p className="text-sm text-white/70">{selected.notes}</p>}
                </div>
                {selected.is_default && (
                  <span className="rounded-full border border-[#d2ff00]/60 bg-[#d2ff00]/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#d2ff00]">
                    Default
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {schedule.length === 0 ? (
                  <p className="text-sm text-white/60">No schedule set.</p>
                ) : (
                  schedule.map((entry) => {
                    const closed = entry.closed;
                    const range =
                      closed || (!entry.start && !entry.end) ? 'Closed' : `${entry.start ?? ''} - ${entry.end ?? ''}`;
                    return (
                      <div
                        key={entry.day}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                      >
                        <span
                          className={`${plusJakarta.className} text-[0.7rem] uppercase tracking-[0.25em] text-white/70`}
                        >
                          {entry.day}
                        </span>
                        <span
                          className={`${spaceGrotesk.className} text-sm font-semibold ${
                            closed ? 'text-red-300' : 'text-white'
                          }`}
                        >
                          {range}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div className="text-sm text-white/70">
                  {locationEmployees.length} employees in this location
                </div>
                <Link
                  href={`/dashboard/planner/${location.id}/${selected.id}${weekParam ? `?week=${encodeURIComponent(weekParam)}` : ''}`}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-[#d2ff00] hover:text-white"
                >
                  Open planner
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
