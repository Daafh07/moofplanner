import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import MoofPlannerLogo from '@/app/ui/moofplanner-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { plusJakarta } from '@/app/ui/fonts';
import { signOut } from '@/auth';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col gap-6 px-4 py-6 text-white">
      <Link href="/" className="rounded-[24px] border border-white/10 bg-gradient-to-br from-[#141f0d] to-[#080f08] p-5 shadow-[0_25px_60px_rgba(2,4,1,0.4)]">
        <div className="flex flex-col items-center gap-2 text-center">
          <MoofPlannerLogo compact className="text-white" />
          <p className={`${plusJakarta.className} text-[0.5rem] uppercase tracking-[0.45em] text-white/60`}>
            Planner cockpit
          </p>
        </div>
      </Link>

      <nav className="flex flex-col gap-3">
        <NavLinks />
      </nav>

      <div className="mt-auto text-sm text-white/70">
        <form
          action={async () => {
            'use server';
            // NextAuth will clear the session cookie and redirect.
            return signOut({ redirectTo: '/login' });
          }}
        >
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white">
            <PowerIcon className="w-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
