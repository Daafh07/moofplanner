'use client';

import { useMemo, useState, useEffect, useActionState } from 'react';
import type { PlanningTime, Location } from '@/app/lib/definitions';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import PlanningTimeForm from './form';
import clsx from 'clsx';
import {
  createLocation,
  deleteLocation,
  deletePlanningTime,
  setPlanningTimeDefault,
  type LocationState,
  type PlanningTimeState,
} from '@/app/lib/actions';
import { useRouter } from 'next/navigation';

export default function PlanningTimeClient({ items, locations }: { items: PlanningTime[]; locations: Location[] }) {
  const sorted = useMemo(() => [...items].sort((a, b) => a.name.localeCompare(b.name)), [items]);
  const [selectedId, setSelectedId] = useState<string | null>(sorted[0]?.id ?? null);
  const selected = selectedId ? sorted.find((p) => p.id === selectedId) : sorted[0];
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [defaultState, setDefaultAction] = useActionState<PlanningTimeState, FormData>(setPlanningTimeDefault, {
    status: 'idle',
    message: undefined,
  });
  const [deleteState, deleteAction] = useActionState<PlanningTimeState, FormData>(deletePlanningTime, {
    status: 'idle',
    message: undefined,
  });
  const [locationState, locationAction] = useActionState<LocationState, FormData>(createLocation, {
    status: 'idle',
    message: undefined,
  });
  const [locationDeleteState, locationDeleteAction] = useActionState<LocationState, FormData>(deleteLocation, {
    status: 'idle',
    message: undefined,
  });
  const [showCreateLocation, setShowCreateLocation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (defaultState.status === 'success' || deleteState.status === 'success') {
      setShowEdit(false);
      if (deleteState.status === 'success') {
        setSelectedId(sorted[0]?.id ?? null);
      }
      router.refresh();
    }
  }, [defaultState.status, deleteState.status, router]);

  useEffect(() => {
    if (locationState.status === 'success' || locationDeleteState.status === 'success') {
      setShowCreateLocation(false);
      router.refresh();
    }
  }, [locationState.status, locationDeleteState.status, router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 rounded-[28px] border border-white/10 bg-black/20 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.5em] text-white/60`}>Organization</p>
            <h1 className={`${spaceGrotesk.className} text-2xl font-semibold`}>Planning Time</h1>
          </div>
          <button type="button" onClick={() => setShowCreate(true)} className="cta-primary">
            Create
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-white/10 bg-black/25 p-3">
          <div className="flex items-center justify-between px-3 pb-3">
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.35em] text-white/60`}>All planning</p>
            <span className="text-xs text-white/50">{sorted.length}</span>
          </div>
          <div className="flex flex-col gap-2 px-1 pb-1">
            {sorted.length === 0 ? (
              <p className="px-2 text-sm text-white/70">No planning items yet.</p>
            ) : (
              sorted.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={clsx(
                    `${spaceGrotesk.className} w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition`,
                    item.id === selected?.id
                      ? 'border-[#d2ff00] bg-[#d2ff00]/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/80 hover:border-[#d2ff00] hover:text-white',
                  )}
                >
                  {item.name}
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
                  Planning block
                </p>
                <h2 className={`${spaceGrotesk.className} mt-1 text-2xl font-semibold`}>{selected.name}</h2>
                <p className="text-sm text-white/70">
                  {selected.start_time || selected.end_time
                    ? `${selected.start_time ?? ''} ${selected.end_time ? `- ${selected.end_time}` : ''}`
                    : 'No timeframe set yet.'}
                </p>
                {selected.is_default ? (
                  <span className="mt-2 inline-flex rounded-full border border-[#d2ff00]/60 bg-[#d2ff00]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#d2ff00]">
                    Default
                  </span>
                ) : (
                  <form action={setDefaultAction} className="mt-2">
                    <input type="hidden" name="planningId" value={selected.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-[#d2ff00] hover:text-white"
                    >
                      Set as default
                    </button>
                  </form>
                )}
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
                      if (!selected) return;
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

              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className={`${plusJakarta.className} text-[0.6rem] uppercase tracking-[0.35em] text-white/60`}>
                  Weekly schedule
                </p>
                <ScheduleList schedule={selected.hours_text} />
                <div className="space-y-1">
                  <p className={`${plusJakarta.className} text-[0.6rem] uppercase tracking-[0.35em] text-white/60`}>
                    Location
                  </p>
                  <p className={`${spaceGrotesk.className} text-base font-semibold text-white`}>
                    {selected.location_name ?? selected.location ?? '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className={`${plusJakarta.className} text-[0.6rem] uppercase tracking-[0.35em] text-white/60`}>
                    Notes
                  </p>
                  <p className="text-sm text-white/70">{selected.notes ?? '—'}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/70">Select or create a planning block to view details.</p>
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
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>Create planning</p>
            <h3 className={`${spaceGrotesk.className} text-2xl font-semibold text-white`}>New planning block</h3>
            <div className="mt-4">
              <PlanningTimeForm onSuccess={() => setShowCreate(false)} locations={locations} />
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
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>Edit planning</p>
            <h3 className={`${spaceGrotesk.className} text-2xl font-semibold text-white`}>Update planning block</h3>
            <div className="mt-4">
              <PlanningTimeForm
                onSuccess={() => {
                  setShowEdit(false);
                  router.refresh();
                }}
                locations={locations}
                initialValues={{
                  id: selected.id,
                  name: selected.name,
                  location_id: selected.location_id ?? undefined,
                  location: selected.location ?? selected.location_name ?? '',
                  startTime: selected.start_time,
                  endTime: selected.end_time,
                  startDay: selected.start_day,
                  endDay: selected.end_day,
                  hoursText: selected.hours_text,
                  notes: selected.notes,
                  isDefault: selected.is_default,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
        <div className="flex items-center justify-between pb-4">
          <div>
            <p className={`${plusJakarta.className} text-[0.6rem] uppercase tracking-[0.35em] text-white/60`}>
              Locations / Stores
            </p>
            <h3 className={`${spaceGrotesk.className} text-xl font-semibold`}>Manage locations</h3>
          </div>
          <button type="button" className="cta-primary" onClick={() => setShowCreateLocation(true)}>
            Create
          </button>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {locations.length === 0 && <p className="text-sm text-white/60">No locations yet.</p>}
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className={`${spaceGrotesk.className} text-sm font-semibold`}>{loc.name}</p>
                {loc.description && <p className="text-xs text-white/60">{loc.description}</p>}
              </div>
              <form
                action={async (formData) => {
                  formData.set('id', loc.id);
                  await locationDeleteAction(formData);
                }}
              >
                <button
                  type="submit"
                  className="rounded-full border border-red-400/60 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-red-200 transition hover:border-red-300 hover:text-white"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
        {(locationState.message || locationDeleteState.message) && (
          <p
            className={`${spaceGrotesk.className} mt-2 text-sm ${
              locationState.status === 'success' || locationDeleteState.status === 'success'
                ? 'text-[#d2ff00]'
                : 'text-red-300'
            }`}
          >
            {locationState.message ?? locationDeleteState.message}
          </p>
        )}
      </div>

      {showCreateLocation && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <div className="relative mt-10 w-full max-w-xl rounded-[32px] border border-white/15 bg-[#0b120b]/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
            <button
              type="button"
              onClick={() => setShowCreateLocation(false)}
              className="absolute right-4 top-4 text-white/60 hover:text-white"
            >
              ✕
            </button>
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>Create location</p>
            <h3 className={`${spaceGrotesk.className} text-2xl font-semibold text-white`}>New location</h3>
            <form action={locationAction} className="mt-4 space-y-4">
              <label className="block space-y-2 text-sm text-white/80">
                <span className={`${plusJakarta.className} block text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
                  Name
                </span>
                <input
                  name="name"
                  required
                  placeholder="Store A"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#d2ff00] focus:outline-none focus:ring-2 focus:ring-[#d2ff00]/30"
                />
              </label>
              <label className="block space-y-2 text-sm text-white/80">
                <span className={`${plusJakarta.className} block text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
                  Description
                </span>
                <input
                  name="description"
                  placeholder="Main branch"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#d2ff00] focus:outline-none focus:ring-2 focus:ring-[#d2ff00]/30"
                />
              </label>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateLocation(false)}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="cta-primary">
                  Create
                </button>
              </div>
              {locationState.message && (
                <p
                  className={`${spaceGrotesk.className} text-sm ${
                    locationState.status === 'success' ? 'text-[#d2ff00]' : 'text-red-300'
                  }`}
                >
                  {locationState.message}
                </p>
              )}
            </form>
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

function ScheduleList({ schedule }: { schedule: string | null }) {
  let parsed: { day: string; start?: string; end?: string; closed?: boolean }[] = [];
  if (schedule) {
    try {
      const temp = JSON.parse(schedule);
      if (Array.isArray(temp)) parsed = temp;
    } catch {
      parsed = [];
    }
  }
  const hasData = parsed.length > 0;
  return (
    <div className="space-y-2">
      {hasData ? (
        parsed.map((entry) => {
          const closed = entry.closed;
          const range = closed ? 'Closed' : entry.start || entry.end ? `${entry.start ?? ''} - ${entry.end ?? ''}` : '—';
          return (
            <div key={entry.day} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <span className={`${plusJakarta.className} text-[0.7rem] uppercase tracking-[0.25em] text-white/70`}>
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
      ) : (
        <p className="text-sm text-white/70">No schedule set.</p>
      )}
    </div>
  );
}
