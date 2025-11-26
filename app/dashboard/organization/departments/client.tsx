'use client';

import { useMemo, useState } from 'react';
import type { Department } from '@/app/lib/definitions';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import DepartmentForm from './form';
import clsx from 'clsx';

export default function DepartmentsClient({ departments }: { departments: Department[] }) {
  const sorted = useMemo(
    () => [...departments].sort((a, b) => a.name.localeCompare(b.name)),
    [departments],
  );
  const [selectedId, setSelectedId] = useState(sorted[0]?.id);
  const selected = sorted.find((d) => d.id === selectedId) ?? sorted[0];
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 rounded-[28px] border border-white/10 bg-black/20 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.5em] text-white/60`}>Organization</p>
          <h1 className={`${spaceGrotesk.className} text-2xl font-semibold`}>Departments</h1>
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="cta-primary">
          Create
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-white/10 bg-black/25 p-3">
          <div className="flex items-center justify-between px-3 pb-3">
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.35em] text-white/60`}>All departments</p>
            <span className="text-xs text-white/50">{sorted.length}</span>
          </div>
          <div className="flex flex-col gap-2 px-1 pb-1">
            {sorted.length === 0 ? (
              <p className="px-2 text-sm text-white/70">No departments yet.</p>
            ) : (
              sorted.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setSelectedId(dept.id)}
                  className={clsx(
                    `${spaceGrotesk.className} w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition`,
                    dept.id === selected?.id
                      ? 'border-[#d2ff00] bg-[#d2ff00]/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/80 hover:border-[#d2ff00] hover:text-white',
                  )}
                >
                  {dept.name}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
          {selected ? (
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-3">
                <p className={`${plusJakarta.className} text-[0.6rem] uppercase tracking-[0.35em] text-white/60`}>
                  Department
                </p>
                <h2 className={`${spaceGrotesk.className} mt-1 text-2xl font-semibold`}>{selected.name}</h2>
                <p className="text-sm text-white/70">{selected.description ?? 'No description yet.'}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <DetailTile title="Roles" value={selected.roles ? `${selected.roles}` : '—'} />
                <DetailTile title="Members" value={selected.members ? `${selected.members}` : '—'} />
                <DetailTile title="Schedules" value="—" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Link employees and approvers to this department to scope access to schedules and reports.
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/70">Select or create a department to view details.</p>
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
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>Create department</p>
            <h3 className={`${spaceGrotesk.className} text-2xl font-semibold text-white`}>New department</h3>
            <div className="mt-4">
              <DepartmentForm onSuccess={() => setShowCreate(false)} />
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
