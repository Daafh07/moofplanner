import { inter } from '@/app/ui/fonts';
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
    ? 'text-2xl md:text-3xl'
    : 'text-[36px] md:text-[40px]';

  return (
    <div
      className={clsx(
        `${inter.className}`,
        'flex items-center justify-center leading-none',
        className ?? 'text-white',
      )}
    >
      <p className={textClass}>MoofPlanner</p>
    </div>
  );
}
