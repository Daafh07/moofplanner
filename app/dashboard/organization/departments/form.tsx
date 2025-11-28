'use client';

import { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { createDepartment, type DepartmentState, updateDepartment } from '@/app/lib/actions';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import { useRouter } from 'next/navigation';

const initialState: DepartmentState = { status: 'idle', message: undefined };

export default function DepartmentForm({
  onSuccess,
  initialValues,
}: {
  onSuccess?: () => void;
  initialValues?: { id?: string; name?: string; description?: string | null };
}) {
  const actionFn = initialValues?.id ? updateDepartment : createDepartment;
  const submitAction = async (prevState: DepartmentState, formData: FormData): Promise<DepartmentState> => {
    const result = await actionFn(prevState, formData);
    return {
      status: result.status as DepartmentState['status'],
      message: result.message,
    };
  };
  const [state, formAction] = useActionState<DepartmentState, FormData>(submitAction, initialState);
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
      {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}
      <Field label="Name" name="name" placeholder="Bakery" required defaultValue={initialValues?.name} />
      <div className="space-y-3">
        <Field
          label="Description"
          name="description"
          placeholder="Front-of-house and pastry team"
          defaultValue={initialValues?.description ?? undefined}
        />
      </div>

      <button type="submit" className="cta-primary w-full justify-center">
        {initialValues?.id ? 'Update department' : 'Create department'}
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
  defaultValue?: string;
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
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#d2ff00] focus:outline-none focus:ring-2 focus:ring-[#d2ff00]/30"
      />
    </label>
  );
}
