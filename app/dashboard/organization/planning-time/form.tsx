'use client';

import { useEffect, useRef, useState } from 'react';
import { useActionState } from 'react';
import { createPlanningTime, type PlanningTimeState, updatePlanningTime } from '@/app/lib/actions';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import { useRouter } from 'next/navigation';

const initialState: PlanningTimeState = { status: 'idle', message: undefined };

type FormValues = {
  id?: string;
  name?: string;
  location?: string | null;
  location_id?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  startDay?: string | null;
  endDay?: string | null;
  hoursText?: string | null;
  notes?: string | null;
  isDefault?: boolean | null;
};

export default function PlanningTimeForm({
  onSuccess,
  initialValues,
  locations = [],
}: {
  onSuccess?: () => void;
  initialValues?: FormValues;
  locations?: { id: string; name: string }[];
}) {
  const actionFn = initialValues?.id ? updatePlanningTime : createPlanningTime;
  const submitAction: (prev: PlanningTimeState, formData: FormData) => Promise<PlanningTimeState> = (prev, fd) =>
    actionFn(prev, fd);
  const [state, formAction] = useActionState<PlanningTimeState, FormData>(submitAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [selectedLocationId, setSelectedLocationId] = useState(
    initialValues?.location_id ?? locations[0]?.id ?? '',
  );
  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const h = Math.floor(i / 4)
      .toString()
      .padStart(2, '0');
    const m = ((i % 4) * 15).toString().padStart(2, '0');
    return `${h}:${m}`;
  });
  const [dailyTimes, setDailyTimes] = useState<{ day: string; start: string; end: string; closed?: boolean }[]>(
    (() => {
      try {
        if (initialValues?.hoursText) {
          const parsed = JSON.parse(initialValues.hoursText);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (_) {
        /* ignore */
      }
      return dayOptions.map((day) => ({ day, start: '', end: '', closed: false }));
    })(),
  );

  const updateDayTime = (day: string, field: 'start' | 'end', value: string) => {
    setDailyTimes((prev) => prev.map((entry) => (entry.day === day ? { ...entry, [field]: value } : entry)));
  };

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      setSelectedLocationId(locations[0]?.id ?? '');
      setDailyTimes(dayOptions.map((day) => ({ day, start: '', end: '' })));
      router.refresh();
      onSuccess?.();
    }
  }, [state.status, router, onSuccess, locations, dayOptions]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-5 rounded-3xl border border-white/10 bg-black/20 p-6 text-white"
    >
      {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}
      <Field
        label="Name"
        name="name"
        placeholder="Morning shift planning"
        required
        defaultValue={initialValues?.name}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 text-sm text-white/80 md:col-span-2">
          <span className={`${plusJakarta.className} block text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
            Weekly time ranges (per day)
          </span>
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
            {dailyTimes.map((entry) => (
              <div key={entry.day} className="flex flex-wrap items-center gap-3 md:gap-4">
                <span className="w-28 text-xs uppercase tracking-[0.25em] text-white/60">{entry.day}</span>
                <SelectInput
                  label=""
                  name={`${entry.day}-start`}
                  options={['', ...timeOptions]}
                  value={entry.closed ? '' : entry.start}
                  disabled={entry.closed}
                  className="min-w-[140px] flex-1"
                  onChange={(val) => updateDayTime(entry.day, 'start', val)}
                />
                <SelectInput
                  label=""
                  name={`${entry.day}-end`}
                  options={['', ...timeOptions]}
                  value={entry.closed ? '' : entry.end}
                  disabled={entry.closed}
                  className="min-w-[140px] flex-1"
                  onChange={(val) => updateDayTime(entry.day, 'end', val)}
                />
                <label className="flex items-center gap-2 text-xs text-white/70" data-cursor="danger" title="Closed day">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/30 bg-white/5 text-[#d2ff00]"
                    checked={!!entry.closed}
                    onChange={(e) =>
                      setDailyTimes((prev) =>
                        prev.map((item) =>
                          item.day === entry.day
                            ? {
                                ...item,
                                closed: e.target.checked,
                                start: e.target.checked ? '' : item.start,
                                end: e.target.checked ? '' : item.end,
                              }
                            : item,
                        ),
                      )
                    }
                 />
                 Closed
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 text-sm text-white/80">
          <span className={`${plusJakarta.className} block text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
            Link to existing location (required)
          </span>
          <div className="flex flex-wrap gap-2">
            {locations.length === 0 && (
              <p className="text-sm text-white/60">No locations yet. Create one first.</p>
            )}
            {locations.map((loc) => (
              <button
                type="button"
                key={loc.id}
                onClick={() => setSelectedLocationId(loc.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  selectedLocationId === loc.id
                    ? 'border-[#d2ff00] bg-[#d2ff00]/10 text-white'
                    : 'border-white/20 bg-white/5 text-white/70 hover:border-[#d2ff00] hover:text-white'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
        {/* Keep a hidden free-text field for backward compatibility but do not render an input */}
        <input type="hidden" name="location" value={initialValues?.location ?? ''} />
      </div>
      <input type="hidden" name="locationId" value={selectedLocationId} />
      <input type="hidden" name="startDay" value={dayOptions[0]} />
      <input type="hidden" name="endDay" value={dayOptions[dayOptions.length - 1]} />
      <input type="hidden" name="hoursText" value={JSON.stringify(dailyTimes)} />
      <label className="flex items-center gap-3 text-sm text-white/80">
        <input
          type="checkbox"
          name="isDefault"
          value="true"
          defaultChecked={!!initialValues?.isDefault}
          className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#d2ff00] focus:ring-2 focus:ring-[#d2ff00]/40"
        />
        <span className={`${plusJakarta.className} text-[0.75rem] uppercase tracking-[0.2em] text-white/70`}>
          Set as default
        </span>
      </label>
      <div className="space-y-3">
        <Field
          label="Notes"
          name="notes"
          placeholder="Prep inventory and assign supervisors"
          defaultValue={initialValues?.notes ?? ''}
        />
      </div>

      <button type="submit" className="cta-primary w-full justify-center">
        {initialValues?.id ? 'Update planning time' : 'Create planning time'}
      </button>

      {state.message && (
        <p
          className={`${spaceGrotesk.className} text-sm ${
            state.status === 'success' ? 'text-[#d2ff00]' : 'text-red-300'
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number | null;
}) {
  return (
    <label className="block space-y-2 text-sm text-white/80">
      <span className={`${plusJakarta.className} block text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? undefined}
        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#d2ff00] focus:outline-none focus:ring-2 focus:ring-[#d2ff00]/30"
      />
    </label>
  );
}

function SelectInput({
  label,
  name,
  options,
  required = false,
  defaultValue,
  value,
  onChange,
  className,
  disabled = false,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block space-y-2 text-sm text-white/80">
      <span className={`${plusJakarta.className} block text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
        {label}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#d2ff00] focus:outline-none focus:ring-2 focus:ring-[#d2ff00]/30 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ''}`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectField({
  label,
  name,
  required = false,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm text-white/80">
      <span className={`${plusJakarta.className} block text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
        {label}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#d2ff00] focus:outline-none focus:ring-2 focus:ring-[#d2ff00]/30"
      >
        {children}
      </select>
    </label>
  );
}
