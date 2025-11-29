import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { fetchLocationsByUser, fetchDraftsByUser, fetchPublishedDraftsByUser } from '@/app/lib/data';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import Link from 'next/link';
import { deletePlannerDraft } from '@/app/lib/actions';

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
  const drafts = userId ? await fetchDraftsByUser(userId) : [];
  const archived = userId ? await fetchPublishedDraftsByUser(userId) : [];

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
                href={`/dashboard/planner/${loc.id}/week`}
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

      {drafts.length > 0 && (
        <section className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className={`${plusJakarta.className} text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>Drafts</p>
              <h2 className={`${spaceGrotesk.className} text-xl font-semibold`}>Saved planners</h2>
            </div>
            <span className="text-xs text-white/60">{drafts.length} draft{drafts.length > 1 ? 's' : ''}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {drafts.map((draft) => (
              <div key={draft.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <div className="space-y-1">
                  <p className={`${plusJakarta.className} text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
                    {draft.week ?? 'No week'}
                  </p>
                  <p className={`${spaceGrotesk.className} text-lg font-semibold text-white`}>
                    {draft.location_name ?? 'Location'} · {draft.planning_name ?? 'Plan'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/planner/${draft.location_id}/${draft.planning_id}${draft.week ? `?week=${encodeURIComponent(draft.week)}` : ''}`}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-[#d2ff00] hover:text-white"
                  >
                    Edit
                  </Link>
                  <form
                    action={async (formData) => {
                      'use server';
                      await deletePlannerDraft(formData);
                    }}
                  >
                    <input type="hidden" name="id" value={draft.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-300/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-red-200 transition hover:border-red-200 hover:text-white"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {archived.length > 0 && (
        <section className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className={`${plusJakarta.className} text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>Archive</p>
              <h2 className={`${spaceGrotesk.className} text-xl font-semibold`}>Published planners</h2>
            </div>
            <span className="text-xs text-white/60">{archived.length} item{archived.length > 1 ? 's' : ''}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {archived.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <div className="space-y-1">
                  <p className={`${plusJakarta.className} text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
                    {item.week ?? 'No week'}
                  </p>
                  <p className={`${spaceGrotesk.className} text-lg font-semibold text-white`}>
                    {item.location_name ?? 'Location'} · {item.planning_name ?? 'Plan'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/planner/${item.location_id}/${item.planning_id}${item.week ? `?week=${encodeURIComponent(item.week)}&readOnly=1` : '?readOnly=1'}`}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-[#d2ff00] hover:text-white"
                  >
                    View
                  </Link>
                  <Link
                    href={`/dashboard/planner/${item.location_id}/${item.planning_id}${item.week ? `?week=${encodeURIComponent(item.week)}&readOnly=1` : '?readOnly=1'}`}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-[#d2ff00] hover:text-white"
                  >
                    Print
                  </Link>
                  <form
                    action={async (formData) => {
                      'use server';
                      await deletePlannerDraft(formData);
                    }}
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-300/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-red-200 transition hover:border-red-200 hover:text-white"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
