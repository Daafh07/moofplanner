import CursorController from '@/app/ui/cursor-controller';
import AuthPanel from '@/app/ui/auth-panel';
import MoofPlannerLogo from '@/app/ui/moofplanner-logo';
import { plusJakarta } from '@/app/ui/fonts';
import Link from 'next/link';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden moof-gradient text-white pt-28 sm:pt-32">
      <CursorController />
      <nav className="nav-shell nav-shell--top">
        <MoofPlannerLogo compact className="text-white" />
        <div className="flex items-center gap-3">
          <Link href="/#pricing" className={`${plusJakarta.className} store-pill`}>
            See price plans
          </Link>
        </div>
      </nav>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_25%,rgba(210,255,0,0.3),transparent_55%),radial-gradient(circle_at_85%_-10%,rgba(244,247,224,0.18),transparent_60%),linear-gradient(135deg,#0b1409,#111a0f,#0f160b)]" />
      <div className="hero-noise" />
      <div className="hero-rings" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-12">
        <div className="w-full rounded-[56px] bg-gradient-to-br from-[rgba(244,247,224,0.2)] via-[rgba(210,255,0,0.07)] to-transparent p-[5px] shadow-[0_55px_150px_rgba(5,8,4,0.65)]">
          <div className="rounded-[52px] border border-white/10 bg-[rgba(8,14,9,0.9)] text-white backdrop-blur-[40px]">
            <div className="px-8 py-12 sm:px-16">
              <Suspense>
                <AuthPanel />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
