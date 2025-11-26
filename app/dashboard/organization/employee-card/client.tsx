'use client';

import { useMemo, useState } from 'react';
import type { Employee, Department } from '@/app/lib/definitions';
import clsx from 'clsx';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import EmployeeForm from './form';
import { Button } from '@/app/ui/button';

export default function EmployeeCardClient({ employees, departments }: { employees: Employee[]; departments: Department[] }) {
  const sorted = useMemo(
    () => [...employees].sort((a, b) => a.name.localeCompare(b.name)),
    [employees],
  );
  const [selectedId, setSelectedId] = useState(sorted[0]?.id);
  const selected = sorted.find((e) => e.id === selectedId) ?? sorted[0];
  const [showCreate, setShowCreate] = useState(false);

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
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <DetailTile title="Phone" value={selected.phone ?? '—'} />
                <DetailTile title="Contract" value={selected.contract_type ?? '—'} />
                <DetailTile title="Hours/week" value={selected.hours_per_week ? `${selected.hours_per_week} h` : '—'} />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <DetailTile title="Role" value={selected.role ?? '—'} />
                <ListTile title="Departments" items={selected.departments ?? []} />
                <ListTile title="Skills" items={selected.skills ?? []} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailTile
                  title="Salary"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-3xl rounded-[32px] border border-white/15 bg-[#0b120b]/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
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
              <EmployeeForm onSuccess={() => setShowCreate(false)} departments={departments} />
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
          items.map((item) => (
            <span
              key={item}
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
