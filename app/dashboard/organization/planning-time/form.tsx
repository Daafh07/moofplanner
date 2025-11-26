'use client';

import { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { createPlanningTime, type PlanningTimeState } from '@/app/lib/actions';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import { useRouter } from 'next/navigation';

const initialState: PlanningTimeState = { status: 'idle', message: undefined };

export default function PlanningTimeForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction] = useActionState(createPlanningTime, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      router.refresh();
      onSuccess?.();
    }
  }, [state.status, router, onSuccess]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-5 rounded-3xl border border-white/10 bg-black/20 p-6 text-white"
    >
      <Field label="Name" name="name" placeholder="Morning shift planning" required />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Start time" name="startTime" placeholder="08:00" />
        <Field label="End time" name="endTime" placeholder="12:00" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Start day" name="startDay" placeholder="Monday" />
        <Field label="End day" name="endDay" placeholder="Sunday" />
      </div>
      <div className="space-y-3">
        <Field label="Hours per day (summary)" name="hoursText" placeholder="Mon-Fri 09:00-18:00, Sat 10:00-16:00" />
      </div>
      <label className="flex items-center gap-3 text-sm text-white/80">
        <input
          type="checkbox"
          name="isDefault"
          value="true"
          className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#d2ff00] focus:ring-2 focus:ring-[#d2ff00]/40"
        />
        <span className={`${plusJakarta.className} text-[0.75rem] uppercase tracking-[0.2em] text-white/70`}>
          Set as default
        </span>
      </label>
      <div className="space-y-3">
        <Field label="Notes" name="notes" placeholder="Prep inventory and assign supervisors" />
      </div>

      <button type="submit" className="cta-primary w-full justify-center">
        Create planning time
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
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
        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#d2ff00] focus:outline-none focus:ring-2 focus:ring-[#d2ff00]/30"
      />
    </label>
  );
}
