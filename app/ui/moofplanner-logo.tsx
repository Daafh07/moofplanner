import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function MoofPlannerLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <CalendarDaysIcon className="h-12 w-12" />
      <p className="text-[44px]">MoofPlanner</p>
    </div>
  );
}
