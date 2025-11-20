'use client';

import { useState, useActionState } from 'react';
import { Button } from '@/app/ui/button';
import { registerUser, type SignupState } from '@/app/lib/actions';

const planOptions = [
  { label: 'Basic Plan — €49/mo', value: 'basic' },
  { label: 'Next Step — €89/mo', value: 'next' },
  { label: 'Moofing Enterprise', value: 'enterprise' },
];

export default function SignupForm() {
  const [selectedPlan, setSelectedPlan] = useState(planOptions[0].value);
  const [state, formAction] = useActionState<SignupState, FormData>(registerUser, {
    status: 'idle',
    message: undefined,
  });

  return (
    <form className="space-y-5" action={formAction}>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-white/60" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Jane Planner"
            required
            className="block w-full rounded-2xl border border-white/15 bg-black/40 py-3 px-4 text-sm text-white placeholder:text-white/40 transition focus:border-[#D2FF00] focus:ring-2 focus:ring-[#D2FF00]/30"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-white/60" htmlFor="signupEmail">
            Email
          </label>
          <input
            id="signupEmail"
            name="email"
            type="email"
            placeholder="team@moofplanner.com"
            required
            className="block w-full rounded-2xl border border-white/15 bg-black/40 py-3 px-4 text-sm text-white placeholder:text-white/40 transition focus:border-[#D2FF00] focus:ring-2 focus:ring-[#D2FF00]/30"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-white/60" htmlFor="signupPassword">
            Password
          </label>
          <input
            id="signupPassword"
            name="password"
            type="password"
            placeholder="••••••••"
            minLength={6}
            required
            className="block w-full rounded-2xl border border-white/15 bg-black/40 py-3 px-4 text-sm text-white placeholder:text-white/40 transition focus:border-[#D2FF00] focus:ring-2 focus:ring-[#D2FF00]/30"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">Choose your plan</p>
        <div className="space-y-3">
          {planOptions.map((plan) => (
            <label
              key={plan.value}
              className={`flex cursor-[inherit] items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${selectedPlan === plan.value ? 'border-[#D2FF00] bg-white/10 text-white' : 'border-white/15 bg-black/30 text-white/70 hover:border-white/30'}`}
            >
              <span className="font-semibold">{plan.label}</span>
              <input
                type="radio"
                name="plan"
                value={plan.value}
                checked={selectedPlan === plan.value}
                onChange={() => setSelectedPlan(plan.value)}
                className="h-4 w-4 accent-[#d2ff00] cursor-[inherit]"
              />
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" aria-disabled={state.status === 'success'}>
        Continue to checkout
      </Button>
      {state.message && (
        <p className={`text-center text-sm ${state.status === 'success' ? 'text-[#d2ff00]' : 'text-red-400'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
