import { Metadata } from 'next';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';

const tiles = [
  { label: 'Loonkosten · week 34', value: '€ 32.450', trend: '+4%', tone: 'alert' },
  { label: 'Ingeplande uren', value: '4.180 u', trend: '+2%', tone: 'neutral' },
  { label: 'Kosten per uur', value: '€ 7,76', trend: '-3%', tone: 'positive' },
  { label: 'Open taken', value: '13 items', trend: '–', tone: 'neutral' },
];

const approvals = [
  { title: 'Verlof - J. Maas', detail: '20 aug • Magazijn' },
  { title: 'Uren - K. Vermeer', detail: 'Week 33 • 36u → 40u' },
  { title: 'Ruil - M. Azizi ↔ L. Chan', detail: 'Vr late shift' },
];

const events = [
  { label: 'Training kassa', day: 'Wo 21/8', people: 12 },
  { label: 'Winkelactie', day: 'Za 24/8', people: 6 },
  { label: 'Verjaardag L. Chan', day: 'Ma 26/8', people: 1 },
];

const roster = [
  { name: 'Kassa', coverage: '100%', open: 0, contract: '✓' },
  { name: 'Keuken', coverage: '88%', open: 2, contract: '⚠︎' },
  { name: 'Magazijn', coverage: '92%', open: 1, contract: '✓' },
];

const organization = [
  { name: 'Sarah Peters', role: 'Planner', contract: '32u', skills: ['BHV', 'Shift lead'] },
  { name: 'Jordan Vos', role: 'Supervisor', contract: '38u', skills: ['Sleutel', 'Payroll'] },
];

const settings = [
  { label: 'Profiel & beveiliging', desc: 'Wachtwoord en MFA ingesteld', status: 'ok' },
  { label: 'Bedrijfsgegevens', desc: 'Budgetten en locaties bijgewerkt', status: 'ok' },
  { label: 'Teamrollen', desc: '3 uitnodigingen openstaand', status: 'attention' },
  { label: 'Rapportage & exports', desc: 'CSV/Excel toegankelijk', status: 'neutral' },
];

export const metadata: Metadata = {
  title: 'Dashboard · MoofPlanner',
};

export default function Page() {
  return (
    <main className="space-y-8 text-white">
      <section className="rounded-[40px] border border-white/15 bg-gradient-to-br from-[#1a2814]/90 via-[#0d140b]/95 to-[#050805] p-8 shadow-[0_40px_140px_rgba(5,10,5,0.65)]">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.5em] text-white/60`}>
              Toegankelijk & beveiligd
            </p>
            <h1 className={`${spaceGrotesk.className} mt-3 text-4xl font-semibold`}>Welkom bij MoofPlanner</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Eén klik naar roosters, uren en aanvragen. Toegang is rol-gebaseerd, data is Supabase-RLS beveiligd, en alle accounts zijn e-mail geverifieerd.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-[#d2ff00] hover:text-white">
                Rooster bekijken
              </button>
              <button className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-[#d2ff00] hover:text-white">
                Uren goedkeuren
              </button>
              <button className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-[#d2ff00] hover:text-white">
                Verlof aanvragen
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {tiles.map((tile) => (
              <div key={tile.label} className="rounded-3xl border border-white/10 bg-black/20 px-5 py-4">
                <p className={`${plusJakarta.className} text-[0.55rem] uppercase tracking-[0.4em] text-white/60`}>
                  {tile.label}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className={`${spaceGrotesk.className} text-2xl font-semibold`}>{tile.value}</p>
                  <span
                    className={`text-xs ${
                      tile.tone === 'alert'
                        ? 'text-[#ff6b6b]'
                        : tile.tone === 'positive'
                        ? 'text-[#d2ff00]'
                        : 'text-white/70'
                    }`}
                  >
                    {tile.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#0e160c]/85 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>Te doen</p>
              <h2 className={`${spaceGrotesk.className} text-2xl font-semibold`}>Goedkeuringen & aanvragen</h2>
            </div>
            <span className="rounded-full bg-[#d2ff00]/20 px-4 py-1 text-xs text-[#d2ff00]">13 open</span>
          </div>
          <div className="mt-5 space-y-4">
            {approvals.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <p className={`${spaceGrotesk.className} text-lg font-semibold`}>{item.title}</p>
                <p className="text-sm text-white/70">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#0b1208]/85 p-6">
          <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>Gebeurtenissen</p>
          <h2 className={`${spaceGrotesk.className} text-2xl font-semibold`}>Training & feestdagen</h2>
          <div className="mt-4 space-y-4">
            {events.map((event) => (
              <div key={event.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div>
                  <p className={`${spaceGrotesk.className} text-lg font-semibold`}>{event.label}</p>
                  <p className="text-sm text-white/70">{event.people} betrokken</p>
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
              <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>Rooster overzicht</p>
              <h2 className={`${spaceGrotesk.className} text-2xl font-semibold`}>Week 34 · contracturen</h2>
            </div>
            <button className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/80 hover:border-[#d2ff00]">
              Drag & drop builder
            </button>
          </div>
          <div className="mt-4 divide-y divide-white/10">
            {roster.map((dept) => (
              <div key={dept.name} className="flex flex-wrap items-center justify-between py-3 text-sm text-white/80">
                <div>
                  <p className={`${spaceGrotesk.className} text-lg font-semibold`}>{dept.name}</p>
                  <p className="text-white/60">Coverage {dept.coverage}</p>
                </div>
                <div className="flex items-center gap-4 text-white/60">
                  <span>Open diensten: {dept.open}</span>
                  <span>Contracturen: {dept.contract}</span>
                  <span className="text-[#d2ff00]">Beschikbaarheid overlay actief</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[#0c140b]/85 p-6 space-y-4">
          <div>
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>Beveiliging</p>
            <h2 className={`${spaceGrotesk.className} text-2xl font-semibold`}>Rolgebaseerde toegang</h2>
            <p className="mt-1 text-sm text-white/70">
              Werkgevers, leidinggevenden en werknemers hebben elk hun eigen dashboard en zien alleen relevante modules.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm text-white/70">Supabase RLS status</p>
            <p className={`${spaceGrotesk.className} text-xl font-semibold text-[#d2ff00]`}>Actief · e-mail verified</p>
          </div>
          <div>
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>Instellingen</p>
            <div className="mt-3 space-y-3">
              {settings.map((setting) => (
                <div key={setting.label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className={`${spaceGrotesk.className} text-lg font-semibold text-white`}>{setting.label}</p>
                    <span
                      className={`text-xs ${
                        setting.status === 'attention'
                          ? 'text-[#ff6b6b]'
                          : setting.status === 'ok'
                          ? 'text-[#d2ff00]'
                          : 'text-white/70'
                      }`}
                    >
                      {setting.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#5a6b4d]">{setting.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[#080f09]/85 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-white/60`}>Organisatie</p>
            <h2 className={`${spaceGrotesk.className} text-2xl font-semibold`}>Medewerkerskaarten & verantwoordelijkheden</h2>
          </div>
          <button className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-[#d2ff00] hover:text-white">
            Export CSV / Excel
          </button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {organization.map((person) => (
            <div key={person.name} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className={`${spaceGrotesk.className} text-lg font-semibold`}>{person.name}</p>
              <p className="text-sm text-white/70">
                {person.role} · {person.contract}
              </p>
              <p className="text-sm text-white/60">Skills: {person.skills.join(', ')}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-dashed border-white/20 px-4 py-3 text-sm text-white/60">
            Voeg afdelingen, verantwoordelijkheden en documenten toe voor volledige controle.
          </div>
        </div>
      </section>
    </main>
  );
}
