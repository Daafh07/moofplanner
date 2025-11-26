'use client';

import { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { createDepartment, type DepartmentState } from '@/app/lib/actions';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import { useRouter } from 'next/navigation';

const initialState: DepartmentState = { status: 'idle', message: undefined };

export default function DepartmentForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction] = useActionState(createDepartment, initialState);
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
      <Field label="Name" name="name" placeholder="Bakery" required />
      <div className="space-y-3">
        <Field label="Description" name="description" placeholder="Front-of-house and pastry team" />
      </div>

      <button type="submit" className="cta-primary w-full justify-center">
        Create department
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
