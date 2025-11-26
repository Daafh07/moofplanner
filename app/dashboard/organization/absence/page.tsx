import { Metadata } from 'next';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';

export const metadata: Metadata = {
  title: 'Absence · Organization',
};

export default function AbsencePage() {
  return (
    <main className="rounded-[40px] border border-white/10 bg-gradient-to-br from-[#1a2814]/90 via-[#0d140b]/95 to-[#050805] p-8 shadow-[0_40px_140px_rgba(5,10,5,0.65)] text-white">
      <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.5em] text-white/60`}>Organization</p>
      <h1 className={`${spaceGrotesk.className} mt-3 text-3xl font-semibold`}>Absence</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/70">Leave requests and absence overview will be managed here.</p>
    </main>
  );
}
