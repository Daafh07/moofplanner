'use client';

import { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { createAdminUser, type AdminUserState } from '@/app/lib/actions';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import { useRouter } from 'next/navigation';

const initialState: AdminUserState = { status: 'idle', message: undefined };

export default function AdminForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction] = useActionState(createAdminUser, initialState);
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
    <form ref={formRef} action={formAction} className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-6 text-white">
      <Field label="Name" name="name" placeholder="Admin Name" required />
      <Field label="Email" name="email" type="email" placeholder="admin@moofplanner.com" required />
      <Field label="Password" name="password" type="password" placeholder="••••••••" required />
      <Field label="Role" name="role" placeholder="admin" />

      <button type="submit" className="cta-primary w-full justify-center">
        Create admin
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
