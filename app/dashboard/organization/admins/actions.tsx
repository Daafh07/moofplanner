'use client';

import { useActionState } from 'react';
import { deleteAdminUser, type AdminUserState } from '@/app/lib/actions';
import { useRouter } from 'next/navigation';

const initialState: AdminUserState = { status: 'idle', message: undefined };

export function RemoveAdminButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState(deleteAdminUser, initialState);

  return (
    <form
      action={async (formData) => {
        formData.set('userId', userId);
        await formAction(formData);
        if (state.status === 'success') {
          router.refresh();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-red-400/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-red-200 transition hover:border-red-300 hover:text-white"
      >
        Remove admin
      </button>
      {state.message && state.status === 'error' && (
        <p className="mt-2 text-xs text-red-300">{state.message}</p>
      )}
    </form>
  );
}
