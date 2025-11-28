import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { fetchLocationsByUser } from '@/app/lib/data';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Planner · Choose Location',
};

export default async function PlannerPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const userId = (session.user as { id?: string } | undefined)?.id;
  const locations = userId ? await fetchLocationsByUser(userId) : [];

  return (
    <main className="space-y-8 rounded-[40px] border border-white/10 bg-gradient-to-br from-[#1a2814]/90 via-[#0d140b]/95 to-[#050805] p-8 shadow-[0_40px_140px_rgba(5,10,5,0.65)] text-white">
      <header className="flex flex-col gap-2 rounded-[28px] border border-white/10 bg-black/20 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.5em] text-white/60`}>Planner</p>
          <h1 className={`${spaceGrotesk.className} text-3xl font-semibold`}>Choose a location to plan</h1>
          <p className="text-sm text-white/70">Pick the store/location you want to plan. You’ll then see its default schedule.</p>
        </div>
      </header>

      <section className="space-y-4">
        {locations.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
            No locations yet. Create one in Planning Time first.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {locations.map((loc) => (
              <Link
                key={loc.id}
                href={`/dashboard/planner/${loc.id}`}
                className="group rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-[#d2ff00]/50 hover:bg-white/10"
              >
                <p className={`${plusJakarta.className} text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
                  Location
                </p>
                <h3 className={`${spaceGrotesk.className} text-xl font-semibold`}>{loc.name}</h3>
                {loc.description && <p className="text-sm text-white/70">{loc.description}</p>}
                <span className="mt-3 inline-flex rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs text-white/70">
                  Open location
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
