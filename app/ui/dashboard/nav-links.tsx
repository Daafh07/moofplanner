'use client';

import {
  HomeIcon,
  UsersIcon,
  CalendarDaysIcon,
  PresentationChartLineIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useMemo, useState } from 'react';

type NavLink = {
  name: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: NavLink[];
};

const links: NavLink[] = [
  { name: 'Overzicht', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Organization',
    href: '/dashboard/organization',
    icon: UsersIcon,
    children: [
      { name: 'Employee card', href: '/dashboard/organization/employee-card' }, 
      { name: 'Admins', href: '/dashboard/organization/admins' },
      { name: 'Availability', href: '/dashboard/organization/availability' },
      { name: 'Absence', href: '/dashboard/organization/absence' },
      { name: 'Shift Swap', href: '/dashboard/organization/shift-swap' },
      { name: 'Planning time', href: '/dashboard/organization/planning-time' },
      { name: 'Departments', href: '/dashboard/organization/departments' },
      { name: 'Leave', href: '/dashboard/organization/leave' },
     
    ],
  },
  { name: 'Planner', href: '/dashboard/planner', icon: CalendarDaysIcon },
  { name: 'Prognose', href: '/dashboard/forecasts', icon: PresentationChartLineIcon },
  { name: 'Instellingen', href: '/dashboard/settings', icon: Cog6ToothIcon },
  { name: 'Exports', href: '/dashboard/exports', icon: ArrowRightOnRectangleIcon },
];

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const active = isActive(pathname, link.href);
        const activeChild = link.children?.some((child) => isActive(pathname, child.href)) ?? false;
        const showChildren = open[link.href] ?? activeChild;

        return (
          <div key={link.name} className="flex flex-col gap-2">
            {link.children ? (
              <button
                type="button"
                onClick={() =>
                  setOpen((prev) => ({ ...prev, [link.href]: !(prev[link.href] ?? activeChild) }))
                }
                className={clsx(
                  'flex h-[48px] items-center justify-between gap-3 rounded-2xl border border-white/10 px-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-[#d2ff00] hover:text-white',
                  {
                    'border-[#d2ff00] bg-black/20 text-white': active || activeChild,
                  },
                )}
              >
                <span className="flex items-center gap-3">
                  {LinkIcon ? <LinkIcon className="w-5" /> : null}
                  {link.name}
                </span>
                <ChevronDownIcon
                  className={clsx('w-4 transition-transform', {
                    'rotate-180': showChildren,
                  })}
                />
              </button>
            ) : (
              <Link
                href={link.href}
                className={clsx(
                  'flex h-[48px] items-center gap-3 rounded-2xl border border-white/10 px-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-[#d2ff00] hover:text-white',
                  {
                    'border-[#d2ff00] bg-black/20 text-white': active,
                  },
                )}
              >
                {LinkIcon ? <LinkIcon className="w-5" /> : null}
                <span>{link.name}</span>
              </Link>
            )}
            {link.children && showChildren && (
              <div className="ml-4 flex flex-col gap-1">
                {link.children.map((child) => {
                  const childActive = isActive(pathname, child.href);
                  return (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={clsx(
                        'flex h-[38px] items-center gap-2 rounded-xl border border-white/5 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:border-[#d2ff00] hover:text-white',
                        { 'border-[#d2ff00] bg-black/10 text-white': childActive },
                      )}
                    >
                      <span>{child.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
