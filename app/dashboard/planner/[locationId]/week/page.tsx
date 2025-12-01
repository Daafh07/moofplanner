import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { fetchLocationsByUser } from '@/app/lib/data';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Planner · Choose week',
};

function currentISOWeek(): string {
  const now = new Date();
  const target = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export default async function PlannerWeekPage({ params }: { params: Promise<{ locationId: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');
  const userId = (session.user as { id?: string } | undefined)?.id;
  const locations = userId ? await fetchLocationsByUser(userId) : [];
  const location = locations.find((l) => l.id === resolvedParams.locationId);
  if (!location) redirect('/dashboard/planner');

  const defaultWeek = currentISOWeek();

  return (
    <main className="space-y-8 rounded-[40px] border border-white/10 bg-gradient-to-br from-[#1a2814]/90 via-[#0d140b]/95 to-[#050805] p-8 shadow-[0_40px_140px_rgba(5,10,5,0.65)] text-white">
      <header className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-black/20 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.5em] text-white/60`}>Planner</p>
          <h1 className={`${spaceGrotesk.className} text-3xl font-semibold`}>{location.name}</h1>
          {location.description && <p className="text-sm text-white/70">{location.description}</p>}
        </div>
        <Link
          href="/dashboard/planner"
          className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-[#d2ff00] hover:text-white"
        >
          Back to locations
        </Link>
      </header>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-2">
          <p className={`${plusJakarta.className} text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>Week</p>
          <h2 className={`${spaceGrotesk.className} text-2xl font-semibold`}>Choose the week for your planning</h2>
          <p className="text-sm text-white/70">
            Select the week you want to plan. Then choose the planning time/block.
          </p>
        </div>
        <form
          className="space-y-4"
          action={`/dashboard/planner/${location.id}`}
          method="GET"
        >
          <label className="block text-sm text-white/80">
            <span className={`${plusJakarta.className} mb-2 block text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
              Week number
            </span>
            <input
              type="week"
              name="week"
              defaultValue={defaultWeek}
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#d2ff00] focus:outline-none focus:ring-2 focus:ring-[#d2ff00]/30"
            />
          </label>
          <button type="submit" className="cta-primary w-full justify-center">
            Continue to planning times
          </button>
        </form>
      </section>
    </main>
  );
}
