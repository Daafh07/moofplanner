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
                  'flex h-[48px] items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-[#d2ff00] hover:text-white md:h-[56px] md:w-[56px] md:px-0 md:gap-0 md:transition-[width,padding,gap] md:duration-200 md:group-hover/nav:w-full md:group-hover/nav:justify-between md:group-hover/nav:px-4 md:group-hover/nav:gap-3',
                  {
                    'border-[#d2ff00] bg-[#d2ff00]/10 text-white shadow-[0_0_0_1px_#d2ff00]': active || activeChild,
                  },
                )}
              >
                <div className="flex w-full items-center justify-center md:group-hover/nav:justify-start md:group-hover/nav:gap-3">
                  <span className="flex h-5 w-5 items-center justify-center">
                    {LinkIcon ? <LinkIcon className="w-5" /> : null}
                  </span>
                  <span className="md:max-w-0 md:overflow-hidden md:opacity-0 md:group-hover/nav:max-w-xs md:group-hover/nav:opacity-100 md:transition-[max-width,opacity] md:duration-200">
                    {link.name}
                  </span>
                </div>
                <ChevronDownIcon
                  className={clsx('hidden w-4 transition-all md:group-hover/nav:block', {
                    'rotate-180': showChildren,
                  })}
                />
              </button>
            ) : (
              <Link
                href={link.href}
                className={clsx(
                  'flex h-[48px] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-[#d2ff00] hover:text-white md:h-[56px] md:w-[56px] md:justify-center md:px-0 md:transition-[width,padding,gap] md:duration-200 md:group-hover/nav:w-full md:group-hover/nav:justify-start md:group-hover/nav:px-4',
                  {
                    'border-[#d2ff00] bg-[#d2ff00]/10 text-white shadow-[0_0_0_1px_#d2ff00]': active,
                  },
                )}
              >
                <div className="flex w-full items-center justify-center md:group-hover/nav:justify-start md:group-hover/nav:gap-3">
                  <span className="flex h-5 w-5 items-center justify-center">
                    {LinkIcon ? <LinkIcon className="w-5" /> : null}
                  </span>
                  <span className="md:max-w-0 md:overflow-hidden md:opacity-0 md:group-hover/nav:max-w-xs md:group-hover/nav:opacity-100 md:transition-[max-width,opacity] md:duration-200">
                    {link.name}
                  </span>
                </div>
              </Link>
            )}
            {link.children && showChildren && (
              <div className="ml-4 flex flex-col gap-1 md:hidden md:group-hover/nav:flex">
                {link.children.map((child) => {
                  const childActive = isActive(pathname, child.href);
                  return (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={clsx(
                        'group flex h-[38px] items-center gap-2 rounded-xl border border-white/5 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:border-[#d2ff00] hover:text-white',
                        {
                          'border-[#d2ff00] bg-[#d2ff00]/10 text-white shadow-[0_0_0_1px_#d2ff00]': childActive,
                        },
                      )}
                    >
                      <span
                        className={clsx('h-1.5 w-1.5 rounded-full bg-white/30 transition', {
                          'bg-[#d2ff00]': childActive,
                        })}
                      />
                      <span className="truncate">{child.name}</span>
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
