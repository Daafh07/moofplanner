import CursorController from '@/app/ui/cursor-controller';
import SideNav from '@/app/ui/dashboard/sidenav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#0d1a10] via-[#0b1c13] to-[#060c07] text-white md:flex-row">
      <CursorController />
      <div className="w-full flex-none border-b border-white/10 bg-gradient-to-b from-[#141f0d] to-[#080f08] md:w-72 md:border-b-0 md:border-r md:border-white/10 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <SideNav />
      </div>
      <div className="grow bg-gradient-to-b from-[#0b160d] via-[#050a05] to-[#020402] p-6 md:overflow-y-auto md:p-12 text-white">
        {children}
      </div>
    </div>
  );
}
