'use client';

import { useMemo, useState } from 'react';
import type { AdminUser } from '@/app/lib/definitions';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import clsx from 'clsx';
import AdminForm from '../employee-card/admin-form';
import { RemoveAdminButton } from './actions';

export default function AdminsClient({ admins }: { admins: AdminUser[] }) {
  const sorted = useMemo(
    () => [...admins].sort((a, b) => a.name.localeCompare(b.name)),
    [admins],
  );
  const [selectedId, setSelectedId] = useState(sorted[0]?.user_id);
  const selected = sorted.find((a) => a.user_id === selectedId) ?? sorted[0];
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 rounded-[28px] border border-white/10 bg-black/20 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.5em] text-white/60`}>Organization</p>
            <h1 className={`${spaceGrotesk.className} text-2xl font-semibold`}>Admins</h1>
          </div>
          <button type="button" onClick={() => setShowCreate(true)} className="cta-primary">
            Create
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-white/10 bg-black/25 p-3">
          <div className="flex items-center justify-between px-3 pb-3">
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.35em] text-white/60`}>All admins</p>
            <span className="text-xs text-white/50">{sorted.length}</span>
          </div>
          <div className="flex flex-col gap-2 px-1 pb-1">
            {sorted.length === 0 ? (
              <p className="px-2 text-sm text-white/70">No admins yet.</p>
            ) : (
              sorted.map((admin) => (
                <button
                  key={admin.user_id}
                  type="button"
                  onClick={() => setSelectedId(admin.user_id)}
                  className={clsx(
                    `${spaceGrotesk.className} w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition`,
                    admin.user_id === selected?.user_id
                      ? 'border-[#d2ff00] bg-[#d2ff00]/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/80 hover:border-[#d2ff00] hover:text-white',
                  )}
                >
                  {admin.name}
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
                  Admin
                </p>
                <h2 className={`${spaceGrotesk.className} mt-1 text-2xl font-semibold`}>{selected.name}</h2>
                <p className="text-sm text-white/70">{selected.email}</p>
                <RemoveAdminButton userId={selected.user_id} />
              </div>

              <div className="grid gap-4 md:grid-cols-1">
                <DetailTile title="Role" value={selected.role ?? 'admin'} />
                <DetailTile title="Created at" value={new Date(selected.created_at).toLocaleDateString()} />
                <DetailTile title="Access" value="Dashboard" />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Admins can sign in to the dashboard with their email and password. Assign roles to scope permissions later.
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/70">Select or create an admin to view details.</p>
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
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>Create admin</p>
            <h3 className={`${spaceGrotesk.className} text-2xl font-semibold text-white`}>New admin</h3>
            <div className="mt-4">
              <AdminForm onSuccess={() => setShowCreate(false)} />
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
