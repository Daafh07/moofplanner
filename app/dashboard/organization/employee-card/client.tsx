'use client';

import { useMemo, useState, useEffect, useActionState } from 'react';
import type { Employee, Department, Location } from '@/app/lib/definitions';
import clsx from 'clsx';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import EmployeeForm from './form';
import { Button } from '@/app/ui/button';
import { deleteEmployee, type EmployeeState } from '@/app/lib/actions';
import { useRouter } from 'next/navigation';

export default function EmployeeCardClient({
  employees,
  departments,
  locations,
}: {
  employees: Employee[];
  departments: Department[];
  locations: Location[];
}) {
  const sorted = useMemo(
    () => [...employees].sort((a, b) => a.name.localeCompare(b.name)),
    [employees],
  );
  const deptNameMap = useMemo(
    () => Object.fromEntries(departments.map((d) => [d.id, d.name])),
    [departments],
  );
  const locationNameMap = useMemo(
    () => Object.fromEntries(locations.map((l) => [l.id, l.name])),
    [locations],
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(sorted[0]?.id);
  const selected = sorted.find((e) => e.id === selectedId) ?? sorted[0];
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const initialLocalState: EmployeeState = { status: 'idle', message: undefined };
  const deleteHandler = async (prevState: EmployeeState, formData: FormData): Promise<EmployeeState> =>
    (await deleteEmployee(prevState, formData)) as EmployeeState;
  const [deleteState, deleteAction] = useActionState<EmployeeState, FormData>(deleteHandler, initialLocalState);
  const router = useRouter();

  useEffect(() => {
    if (deleteState.status === 'success') {
      setShowEdit(false);
      setSelectedId(undefined);
      router.refresh();
    }
  }, [deleteState.status, router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 rounded-[28px] border border-white/10 bg-black/20 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.5em] text-white/60`}>Organization</p>
            <h1 className={`${spaceGrotesk.className} text-2xl font-semibold`}>Employee Card</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="cta-primary"
          >
            Create
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between px-3 pb-3">
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.35em] text-white/60`}>Employees</p>
            <span className="text-xs text-white/50">{sorted.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {sorted.length === 0 && (
              <p className="px-3 text-sm text-white/60">No employees yet.</p>
            )}
            {sorted.map((emp) => (
            <button
              key={emp.id}
              type="button"
              onClick={() => setSelectedId(emp.id)}
              className={clsx(
                `${spaceGrotesk.className} flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition`,
                emp.id === selected?.id
                  ? 'border-[#d2ff00] bg-[#d2ff00]/10 text-white'
                  : 'border-white/10 bg-white/5 text-white/80 hover:border-[#d2ff00] hover:text-white',
              )}
            >
              <span className="truncate">{emp.name}</span>
            </button>
          ))}
        </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
          {selected ? (
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-3">
                <p className={`${plusJakarta.className} text-[0.6rem] uppercase tracking-[0.35em] text-white/60`}>
                  Employee Card
                </p>
                <h2 className={`${spaceGrotesk.className} mt-1 text-2xl font-semibold`}>{selected.name}</h2>
                <p className="text-sm text-white/70">{selected.email}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEdit(true)}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-[#d2ff00] hover:text-white"
                  >
                    Edit
                  </button>
                  <form
                    action={async (formData) => {
                      formData.set('id', selected.id);
                      await deleteAction(formData);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-full border border-red-400/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-red-200 transition hover:border-red-300 hover:text-white"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-1">
                <DetailTile title="Phone" value={selected.phone ?? '—'} />
                <DetailTile title="Contract" value={selected.contract_type ?? '—'} />
                <DetailTile title="Hours/week" value={selected.hours_per_week ? `${selected.hours_per_week} h` : '—'} />
              </div>

              <div className="grid gap-4 md:grid-cols-1">
                <DetailTile title="Role" value={selected.role ?? '—'} />
                <ListTile
                  title="Departments"
                  items={(selected.departments ?? [])
                    .map((id) => deptNameMap[id])
                    .filter((name): name is string => Boolean(name))}
                />
                <ListTile title="Skills" items={selected.skills ?? []} />
                <ListTile
                  title="Locations"
                  items={
                    (selected.location_ids && selected.location_ids.length > 0
                      ? selected.location_ids
                      : selected.location_id
                        ? [selected.location_id]
                        : []
                    )
                      .map((id) => locationNameMap[id] ?? id)
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-1">
                <DetailTile
                  title="Hourly salary"
                  value={
                    typeof selected.salary_cents === 'number'
                      ? `€ ${(selected.salary_cents / 100).toLocaleString('en-US')}`
                      : '—'
                  }
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/70">Select or add an employee.</p>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <div className="relative mt-10 w-full max-w-3xl rounded-[32px] border border-white/15 bg-[#0b120b]/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="absolute right-4 top-4 text-white/60 hover:text-white"
            >
              ✕
            </button>
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>Create employee</p>
            <h3 className={`${spaceGrotesk.className} text-2xl font-semibold text-white`}>New employee</h3>
            <div className="mt-4">
              <EmployeeForm onSuccess={() => setShowCreate(false)} departments={departments} locations={locations} />
            </div>
          </div>
        </div>
      )}
      {showEdit && selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <div className="relative mt-10 w-full max-w-3xl rounded-[32px] border border-white/15 bg-[#0b120b]/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="absolute right-4 top-4 text-white/60 hover:text-white"
            >
              ✕
            </button>
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>Edit employee</p>
            <h3 className={`${spaceGrotesk.className} text-2xl font-semibold text-white`}>Update employee</h3>
            <div className="mt-4">
              <EmployeeForm
                onSuccess={() => {
                  setShowEdit(false);
                  router.refresh();
                }}
                departments={departments}
                locations={locations}
                initialValues={{
                  id: selected.id,
                  name: selected.name,
                  email: selected.email,
                  phone: selected.phone,
                  role: selected.role,
                  contractType: selected.contract_type ?? undefined,
                  hoursPerWeek: selected.hours_per_week ?? undefined,
                  salaryHourly: selected.salary_cents ? selected.salary_cents / 100 : undefined,
                  departments: selected.departments ?? [],
                  skills: selected.skills ?? [],
                  locationId: selected.location_id ?? undefined,
                  locationIds: selected.location_ids ?? undefined,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailTile({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className={`${plusJakarta.className} text-[0.6rem] uppercase tracking-[0.35em] text-white/60`}>{title}</p>
      <p className={`${spaceGrotesk.className} mt-1 text-lg font-semibold text-white`}>{value}</p>
    </div>
  );
}

function ListTile({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className={`${plusJakarta.className} text-[0.6rem] uppercase tracking-[0.35em] text-white/60`}>{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-sm text-white/60">—</span>
        ) : (
          items
            .filter((item) => item && item.trim().length > 0)
            .map((item, idx) => (
              <span
                key={`${item}-${idx}`}
                className={`${plusJakarta.className} rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-white`}
              >
                {item}
              </span>
            ))
        )}
      </div>
    </div>
  );
}
