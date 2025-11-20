import { spaceGrotesk } from '@/app/ui/fonts';
import clsx from 'clsx';

type MoofPlannerLogoProps = {
  compact?: boolean;
  className?: string;
};

export default function MoofPlannerLogo({
  compact = false,
  className,
}: MoofPlannerLogoProps) {
  const textClass = compact
    ? 'text-[32px] md:text-[40px] font-semibold'
    : 'text-[40px] md:text-[48px] font-semibold';

  return (
    <div
      className={clsx(
        `${spaceGrotesk.className}`,
        'flex items-center justify-center leading-none',
        className ?? 'text-white',
      )}
    >
      <p className={textClass}>MoofPlanner</p>
    </div>
  );
}
