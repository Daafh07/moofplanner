import clsx from 'clsx';
import { plusJakarta } from '@/app/ui/fonts';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        plusJakarta.className,
        'inline-flex items-center justify-center rounded-full border border-white/20 bg-white px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#0B1309] transition-colors duration-200 hover:bg-[#D2FF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4F7E0] active:bg-[#c8ef40] aria-disabled:cursor-not-allowed aria-disabled:opacity-60',
        className,
      )}
    >
      {children}
    </button>
  );
}
