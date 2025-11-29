'use client';
 
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';
 
export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const safeCallbackUrl =
    callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
      ? callbackUrl
      : '/dashboard';
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );
 
  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            className="mb-2 block text-xs uppercase tracking-[0.3em] text-white/60"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 transition focus:border-[#D2FF00] focus:ring-2 focus:ring-[#D2FF00]/30"
              id="email"
              type="email"
              name="email"
              placeholder="you@moofplanner.com"
              required
            />
            <AtSymbolIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition peer-focus:text-[#D2FF00]" />
          </div>
        </div>
        <div>
          <label
            className="mb-2 block text-xs uppercase tracking-[0.3em] text-white/60"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 transition focus:border-[#D2FF00] focus:ring-2 focus:ring-[#D2FF00]/30"
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
            <KeyIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition peer-focus:text-[#D2FF00]" />
          </div>
        </div>
      </div>
      <input type="hidden" name="redirectTo" value={safeCallbackUrl} />
      <Button className="w-full" aria-disabled={isPending}>
        Enter workspace <ArrowRightIcon className="button-arrow ml-2 h-5 w-5" />
      </Button>
      <div
        className="flex min-h-[1.5rem] items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && (
          <>
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            <p className="text-sm text-red-400">
              {errorMessage.toString().includes('Invalid credentials')
                ? 'Login failed. Please check your email and password.'
                : errorMessage}
            </p>
          </>
        )}
      </div>
    </form>
  );
}
