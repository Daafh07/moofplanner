'use client';

import { useEffect, useState } from 'react';
import LoginForm from '@/app/ui/login-form';
import SignupForm from '@/app/ui/signup-form';
import MoofPlannerLogo from '@/app/ui/moofplanner-logo';
import { plusJakarta } from '@/app/ui/fonts';

const tabs = [
  { label: 'Login', value: 'login' },
  { label: 'Sign up', value: 'signup' },
];

export default function AuthPanel() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`flex flex-col gap-6 text-white transition-all duration-[900ms] ${mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
      <div className="mb-8 text-center space-y-4">
        <MoofPlannerLogo compact className="text-white" />
        <p className="text-sm uppercase tracking-[0.65em] text-white/70">Access panel</p>
      </div>
      <div className={`flex gap-3 ${plusJakarta.className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setMode(tab.value as 'login' | 'signup')}
            className={`flex-1 rounded-full border px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition ${mode === tab.value ? 'border-white/30 bg-white text-[#0B1309] hover:bg-[#D2FF00]' : 'border-[1.5px] border-white/20 bg-transparent text-white/60 hover:border-[#D2FF00]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {mode === 'login' ? <LoginForm /> : <SignupForm />}
    </div>
  );
}
