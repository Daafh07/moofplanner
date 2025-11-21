 'use client';

import {
  HomeIcon,
  UsersIcon,
  CalendarDaysIcon,
  PresentationChartLineIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Overzicht', href: '/dashboard', icon: HomeIcon },
  { name: 'Organisatie', href: '/dashboard/customers', icon: UsersIcon },
  { name: 'Roosters', href: '/dashboard/invoices', icon: CalendarDaysIcon },
  { name: 'Prognose', href: '/dashboard/forecasts', icon: PresentationChartLineIcon },
  { name: 'Instellingen', href: '/dashboard/settings', icon: Cog6ToothIcon },
  { name: 'Exports', href: '/dashboard/exports', icon: ArrowRightOnRectangleIcon },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] items-center gap-3 rounded-2xl border border-white/10 px-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-[#d2ff00] hover:text-white',
              {
                'border-[#d2ff00] bg-black/20 text-white': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-5" />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </>
  );
}
