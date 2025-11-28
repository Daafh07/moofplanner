import { spaceGrotesk } from '@/app/ui/fonts';
import clsx from 'clsx';

type MoofPlannerLogoProps = {
  compact?: boolean;
  collapsed?: boolean;
  variant?: 'default' | 'nav';
  className?: string;
};

export default function MoofPlannerLogo({
  compact = false,
  collapsed = false,
  variant = 'default',
  className,
}: MoofPlannerLogoProps) {
  const content = collapsed ? 'M' : 'MoofPlanner';
  const textClass =
    variant === 'nav'
      ? 'text-xl md:text-2xl font-semibold tracking-[0.08em]'
      : compact
        ? 'text-2xl md:text-3xl font-semibold tracking-[0.08em]'
        : 'text-[40px] md:text-[48px] font-semibold';
  const collapsedClass =
    'flex h-full w-full items-center justify-center text-center text-[19px] font-semibold tracking-[0.02em] leading-none';

  return (
    <div
      className={clsx(
        `${spaceGrotesk.className}`,
        'flex items-center justify-center leading-none',
        className ?? 'text-white',
      )}
    >
      <p className={collapsed ? collapsedClass : `${textClass} text-center leading-none`}>{content}</p>
    </div>
  );
}
