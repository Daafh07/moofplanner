import CursorController from '@/app/ui/cursor-controller';
import AuthPanel from '@/app/ui/auth-panel';
import MoofPlannerLogo from '@/app/ui/moofplanner-logo';
import { plusJakarta } from '@/app/ui/fonts';
import Link from 'next/link';
import { Suspense } from 'react';
import { Metadata } from 'next';
import ProtectedRoute from '@/app/ui/protected-route';

export const metadata: Metadata = {
  title: 'Login',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawCallback = resolvedSearchParams?.callbackUrl;
  const safeCallback =
    typeof rawCallback === 'string' && rawCallback.startsWith('/') && !rawCallback.startsWith('//')
      ? rawCallback
      : '/dashboard';
  const message = resolvedSearchParams && 'message' in resolvedSearchParams ? (resolvedSearchParams as any).message : undefined;

  return (
    <ProtectedRoute requiresAuth={false} redirectAuthenticatedTo={safeCallback}>
      <main className="relative flex min-h-screen flex-col overflow-hidden moof-gradient text-white">
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

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 min-h-0 items-center justify-center px-4 py-16">
          <div className="w-full rounded-[56px] bg-gradient-to-br from-[rgba(244,247,224,0.2)] via-[rgba(210,255,0,0.07)] to-transparent p-[5px] shadow-[0_55px_150px_rgba(5,8,4,0.65)]">
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto rounded-[52px] border border-white/10 bg-[rgba(8,14,9,0.9)] text-white backdrop-blur-[40px]">
              <div className="px-8 py-12 sm:px-16">
                <Suspense fallback={null}>
                  {message ? <div className="mb-6 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</div> : null}
                  <AuthPanel />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
