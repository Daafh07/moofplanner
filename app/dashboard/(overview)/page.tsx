import { Metadata } from 'next';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import { auth } from '@/auth';
import {
  fetchCompanySnapshot,
  fetchDashboardMetrics,
  fetchPendingApprovals,
  fetchUpcomingEvents,
  fetchOrganizationCards,
} from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Dashboard · MoofPlanner',
};

export default async function Page() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [company, metrics, approvals, events, organization] = await Promise.all([
    fetchCompanySnapshot(userId),
    fetchDashboardMetrics(userId),
    fetchPendingApprovals(),
    fetchUpcomingEvents(),
    fetchOrganizationCards(userId),
  ]);

  const seatLimit = company?.seat_limit ?? null;
  const headcount = company?.headcount ?? 0;
  const seatInfo = seatLimit ? `${headcount}/${seatLimit} seats` : `${headcount} seats • unlimited`;

  return (
    <main className="space-y-8 text-white">
      <section className="rounded-[40px] border border-white/10 bg-gradient-to-br from-[#1a2814]/90 via-[#0d140b]/95 to-[#050805] p-8 shadow-[0_40px_140px_rgba(5,10,5,0.65)]">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.5em] text-white/60`}>
              Secure & access-controlled
            </p>
            <h1 className={`${spaceGrotesk.className} mt-3 text-4xl font-semibold`}>
              {company?.name ?? 'MoofPlanner'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              One click to schedules, hours, and requests. Role-based access, Supabase RLS for data safety, and verified accounts.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-[#d2ff00] hover:text-white">
                View schedule
              </button>
              <button className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-[#d2ff00] hover:text-white">
                Approve hours
              </button>
              <button className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-[#d2ff00] hover:text-white">
                Submit leave
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-4">
              <p className={`${plusJakarta.className} text-[0.55rem] uppercase tracking-[0.4em] text-white/60`}>
                Plan
              </p>
              <p className={`${spaceGrotesk.className} text-2xl font-semibold`}>
                {company?.plan ?? 'No plan'}
              </p>
              <p className="text-sm text-white/60">{seatInfo}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-4">
              <p className={`${plusJakarta.className} text-[0.55rem] uppercase tracking-[0.4em] text-white/60`}>
                Region
              </p>
              <p className={`${spaceGrotesk.className} text-2xl font-semibold`}>
                {company?.region ?? 'Unknown'}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-4">
              <p className={`${plusJakarta.className} text-[0.55rem] uppercase tracking-[0.4em] text-white/60`}>
                Weekly cost
              </p>
              <p className={`${spaceGrotesk.className} text-2xl font-semibold`}>{metrics.weeklyLaborCost}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-4">
              <p className={`${plusJakarta.className} text-[0.55rem] uppercase tracking-[0.4em] text-white/60`}>
                Scheduled hours
              </p>
              <p className={`${spaceGrotesk.className} text-2xl font-semibold`}>{metrics.scheduledHours}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#0e160c]/85 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>
                To do
              </p>
              <h2 className={`${spaceGrotesk.className} text-2xl font-semibold`}>
                Approvals & requests
              </h2>
            </div>
            <span className="rounded-full bg-[#d2ff00]/20 px-4 py-1 text-xs text-[#d2ff00]">
              {metrics.openTasks} open
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {approvals.length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/60">
                No open requests.
              </p>
            )}
            {/* {approvals.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <p className={`${spaceGrotesk.className} text-lg font-semibold`}>{item.title}</p>
                <p className="text-sm text-white/70">
                  {item.detail} · {item.amount}
                </p>
              </div>
            ))} */}
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#0b1208]/85 p-6">
          <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>
            Events
          </p>
          <h2 className={`${spaceGrotesk.className} text-2xl font-semibold`}>
            Training & holidays
          </h2>
          <div className="mt-4 space-y-4">
            {events.length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
                No scheduled events.
              </p>
            )}
            {events.map((event) => (
              <div key={event.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div>
                  <p className={`${spaceGrotesk.className} text-lg font-semibold`}>{event.label}</p>
                  <p className="text-sm text-white/70">{event.people} attending</p>
                </div>
                <span className="text-sm text-white/60">{event.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#0a1109]/90 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>
                Contract check
              </p>
              <h2 className={`${spaceGrotesk.className} text-2xl font-semibold`}>
                Hours & hourly cost
              </h2>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className={`${spaceGrotesk.className} text-lg font-semibold text-white`}>Hourly cost</p>
              <p>{metrics.hourlyCost}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className={`${spaceGrotesk.className} text-lg font-semibold text-white`}>Active headcount</p>
              <p>{company?.headcount ?? 0} employees</p>
            </div>
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#0c140b]/85 p-6 space-y-4">
          <div>
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>
              Organization
            </p>
            <h2 className={`${spaceGrotesk.className} text-2xl font-semibold`}>Planner teams</h2>
            <p className="mt-1 text-sm text-white/70">
              Overview of planners and supervisors with account access.
            </p>
          </div>
          <div className="space-y-3">
            {organization.length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
                No team members linked yet.
              </p>
            )}
            {organization.map((member) => (
              <div key={member.email} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className={`${spaceGrotesk.className} text-lg font-semibold`}>{member.name}</p>
                <p className="text-sm text-white/70">{member.email}</p>
                <p className="text-xs text-white/60">Role: {member.role ?? 'planner'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
