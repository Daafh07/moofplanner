import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import MoofPlannerLogo from '@/app/ui/moofplanner-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { plusJakarta } from '@/app/ui/fonts';
import { signOut } from '@/auth';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col gap-5 px-3 py-5 text-white md:items-center md:overflow-hidden md:px-2 md:py-5 md:group-hover/nav:items-stretch">
      <Link
        href="/"
        className="flex items-center justify-center rounded-[14px] border border-white/12 bg-gradient-to-br from-[#141f0d] to-[#080f08] px-2.5 py-2.5 shadow-[0_14px_28px_rgba(2,4,1,0.22)] transition md:h-[56px] md:w-[56px] md:aspect-square md:px-0 md:py-0 md:justify-center md:group-hover/nav:h-[96px] md:group-hover/nav:w-full md:group-hover/nav:px-3 md:group-hover/nav:py-3 md:group-hover/nav:justify-center"
      >
        <div className="flex h-full w-full items-center justify-center gap-2 md:group-hover/nav:h-full md:group-hover/nav:items-center md:group-hover/nav:justify-center md:group-hover/nav:gap-3">
          <MoofPlannerLogo collapsed className="text-white md:block md:group-hover/nav:hidden" />
          <div className="hidden md:group-hover/nav:flex md:h-full md:flex-col md:items-center md:justify-center md:gap-1">
            <MoofPlannerLogo compact variant="nav" className="text-white" />
            <p
              className={`${plusJakarta.className} text-[0.65rem] uppercase tracking-[0.32em] text-white/70`}
            >
              Planner cockpit
            </p>
          </div>
        </div>
      </Link>

      <nav className="flex flex-col gap-2 md:items-center md:group-hover/nav:items-stretch">
        <NavLinks />
      </nav>

      <div className="mt-auto text-sm text-white/70 md:items-center md:group-hover/nav:items-stretch">
        <form
          action={async () => {
            'use server';
            // NextAuth will clear the session cookie and redirect.
            return signOut({ redirectTo: '/login' });
          }}
        >
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white md:h-[64px] md:w-[64px] md:px-0 md:py-3 md:justify-center md:group-hover/nav:w-full md:group-hover/nav:px-4 md:group-hover/nav:justify-center">
            <PowerIcon className="w-4" />
            <span className="md:hidden md:group-hover/nav:inline">Sign out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
