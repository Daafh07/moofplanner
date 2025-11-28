'use client';

import { Fragment, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createShift, deleteShift } from '@/app/lib/actions';

type DayRange = { day: string; start: string; end: string; closed: boolean; range: string };
type DeptEmp = { dept: { id: string; name: string }; emps: { id: string; name: string; hours_per_week?: number }[] };
type Shift = {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes?: number | null;
  notes?: string | null;
};

type Props = {
  dayRanges: DayRange[];
  weekDates: string[];
  deptEmployees: DeptEmp[];
  shifts: Shift[];
  planId: string;
  locationId: string;
};

export default function PlannerBoardClient({ dayRanges, weekDates, deptEmployees, shifts, planId, locationId }: Props) {
  const [localShifts, setLocalShifts] = useState<Shift[]>(shifts);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const shiftsByEmp = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    localShifts.forEach((s) => {
      if (!map[s.employee_id]) map[s.employee_id] = [];
      map[s.employee_id].push(s);
    });
    return map;
  }, [localShifts]);

  const sumHoursForEmployee = (empId: string) => {
    const empShifts = shiftsByEmp[empId] ?? [];
    return empShifts.reduce((acc, s) => acc + durationHours(s.start_time, s.end_time), 0);
  };

  const [modal, setModal] = useState<{
    open: boolean;
    employeeId: string;
    date: string;
    start: string;
    end: string;
  }>({ open: false, employeeId: '', date: '', start: '', end: '' });

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="w-48 px-3 py-2 text-left text-xs uppercase tracking-[0.3em] text-white/60">Department / Employee</th>
                {dayRanges.map((d, idx) => (
                  <th key={d.day} className="px-3 py-2 text-left text-xs uppercase tracking-[0.3em] text-white/60">
                    <div className="flex flex-col">
                      <span>{d.day}</span>
                      <span className="text-[0.65rem] text-white/40">{weekDates[idx]}</span>
                      <span className="mt-1 text-[0.65rem] font-normal text-white/50">{d.closed ? 'Closed' : d.range}</span>
                    </div>
                  </th>
                ))}
            <th className="px-3 py-2 text-left text-xs uppercase tracking-[0.3em] text-white/60">Total hours</th>
          </tr>
        </thead>
        <tbody>
          {deptEmployees.map(({ dept, emps }) => (
            <Fragment key={dept.id}>
              <tr className="border-b border-white/10">
                <td className="bg-white/5 px-3 py-2 font-semibold text-white" colSpan={dayRanges.length + 2}>
                  {dept.name}
                </td>
              </tr>
              {emps.map((emp) => (
                <tr key={emp.id} className="border-b border-white/10">
                  <td className="px-3 py-2 text-white">{emp.name}</td>
                  {dayRanges.map((d, idx) => {
                    const date = weekDates[idx];
                    const dayShifts = (shiftsByEmp[emp.id] ?? []).filter((s) => normalizeDate(s.date) === normalizeDate(date));
                    return (
                      <td key={`${emp.id}-${d.day}`} className="px-3 py-2 align-top">
                        <div
                          className={`rounded-lg border px-3 py-2 ${
                            d.closed ? 'border-red-500/40 bg-red-900/30 text-red-200' : 'border-white/10 bg-white/5 text-white'
                          } space-y-2`}
                        >
                          {d.closed ? (
                            <span>Closed</span>
                          ) : (
                            <>
                              <div className="flex flex-col gap-2">
                                {dayShifts.map((s) => (
                                  <div key={s.id} className="space-y-1 rounded-md bg-white/10 px-2 py-2 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span>
                                        {s.start_time}–{s.end_time}
                                        {s.break_minutes ? ` · break ${s.break_minutes}m` : ''}
                                      </span>
                                      <button
                                        type="button"
                                        className="text-red-300 hover:text-red-200"
                                        onClick={() =>
                                          startTransition(async () => {
                                            const fd = new FormData();
                                            fd.set('id', s.id);
                                            fd.set('path', `/dashboard/planner/${locationId}/${planId}`);
                                            const ok = await deleteShift(fd);
                                            if (ok) {
                                              setLocalShifts((prev) => prev.filter((x) => x.id !== s.id));
                                            }
                                            router.refresh();
                                          })
                                        }
                                      >
                                        Delete
                                      </button>
                                    </div>
                                    {s.notes && <p className="text-white/70">{s.notes}</p>}
                                  </div>
                                ))}
                                {dayShifts.length === 0 && <p className="text-[0.7rem] text-white/60">No shifts</p>}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setModal({
                                      open: true,
                                      employeeId: emp.id,
                                      date,
                                      start: d.start || '09:00',
                                      end: d.end || '17:00',
                                    })
                                  }
                                  className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/20"
                                >
                                  Add shift
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-sm text-white">
                    {sumHoursForEmployee(emp.id).toFixed(1)}h / {(emp.hours_per_week ?? 0).toFixed(1)}h
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4">
          <div className="mt-10 w-full max-w-lg rounded-2xl border border-white/15 bg-[#0d140b]/95 p-6 text-white shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add shift</h3>
              <button
                onClick={() => setModal((m) => ({ ...m, open: false }))}
                className="rounded-full bg-white/10 px-2 py-1 text-sm hover:bg-white/20"
              >
                Close
              </button>
            </div>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                fd.set('path', `/dashboard/planner/${locationId}/${planId}`);
                startTransition(async () => {
                  const created = await createShift(fd);
                  if (created) {
                    setLocalShifts((prev) => [...prev, created]);
                  }
                  setModal((m) => ({ ...m, open: false }));
                  router.refresh();
                });
              }}
            >
              <input type="hidden" name="planningId" value={planId} />
              <input type="hidden" name="locationId" value={locationId} />
              <input type="hidden" name="employeeId" value={modal.employeeId} />
              <input type="hidden" name="date" value={modal.date} />
              <div className="flex gap-2">
                <label className="flex flex-col text-xs text-white/70 w-1/2">
                  Start
                  <input
                    name="startTime"
                    type="time"
                    defaultValue={modal.start}
                    className="mt-1 rounded-md bg-black/40 px-2 py-2 text-white outline-none"
                  />
                </label>
                <label className="flex flex-col text-xs text-white/70 w-1/2">
                  End
                  <input
                    name="endTime"
                    type="time"
                    defaultValue={modal.end}
                    className="mt-1 rounded-md bg-black/40 px-2 py-2 text-white outline-none"
                  />
                </label>
              </div>
              <label className="flex flex-col text-xs text-white/70">
                Break (minutes)
                <input
                  name="breakMinutes"
                  type="number"
                  min={0}
                  defaultValue={0}
                  className="mt-1 rounded-md bg-black/40 px-2 py-2 text-white outline-none"
                />
              </label>
              <label className="flex flex-col text-xs text-white/70">
                Note (visible to employee)
                <textarea
                  name="notes"
                  rows={2}
                  className="mt-1 rounded-md bg-black/40 px-2 py-2 text-white outline-none"
                  placeholder="Tasks, remarks..."
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModal((m) => ({ ...m, open: false }))}
                  className="w-1/3 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 rounded-md bg-white text-[#0d140b] px-3 py-2 text-sm font-semibold hover:bg-white/90"
                  disabled={pending}
                >
                  {pending ? 'Saving…' : 'Save shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function durationHours(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return Math.max(mins, 0) / 60;
}

function normalizeDate(value: string | null | undefined) {
  if (!value) return '';
  if (typeof value === 'string') {
    return value.includes('T') ? value.split('T')[0] : value;
  }
  try {
    const cast = String(value);
    return cast.includes('T') ? cast.split('T')[0] : cast;
  } catch {
    return '';
  }
}
