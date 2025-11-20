'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BoltIcon } from '@heroicons/react/24/outline';
import MoofPlannerLogo from '@/app/ui/moofplanner-logo';
import { spaceGrotesk, plusJakarta } from '@/app/ui/fonts';
import { Metadata } from 'next';
import CursorController from '@/app/ui/cursor-controller';


export const metadata: Metadata = {
  title: 'MoofPlanner',
  description: 'Modern workforce planning platform to plan smarter and work better.',
};

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Price', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Account', href: '#account' },
  { label: 'Contact', href: '#contact' },
];

const heroMetrics = [
  { label: 'Companies trusting us', value: '10+' },
  { label: 'Hours saved', value: '200+' },
  { label: 'Planning mistakes reduced', value: '60%' },
];

const manifestoText = [
  'Redefining workforce calm.',
  'No messy schedules.',
  'Clarity for every shift.',
  'Clock your hours, zero stress.',
];

const pricePlans = [
  {
    name: 'Basic Plan',
    price: '€49',
    cadence: 'Company / month',
    features: [
      'Planning system',
      'Availability boards',
      'Live cost estimate',
      'Up to 20 employees',
    ],
    badge: 'Most adopted',
    accent: '#D2FF00',
  },
  {
    name: 'Next Step',
    price: '€89',
    cadence: 'Per user / month',
    features: [
      'Team scheduling',
      'Multiple schedule views',
      'Integrated time clock',
      'Up to 75 employees',
    ],
    badge: 'Ready for growth',
    accent: '#B5FF5A',
  },
  {
    name: 'Moofing',
    price: 'Custom',
    cadence: 'Enterprise',
    features: ['Unlimited teams', 'Unlimited schedules', 'Unlimited employees', '24/7 support'],
    badge: 'For large orgs',
    accent: '#ffffffd2',
  },
];

const aboutPillars = [
  {
    title: 'Automate & humanize',
    copy: 'MoofPlanner combines automation with human-centred flows so managers feel supported, not replaced.',
  },
  {
    title: 'Data-driven insight',
    copy: 'Real-time dashboards surface labor costs, contract hours, and open shifts before they become issues.',
  },
  {
    title: 'Moof DNA',
    copy: 'Built for modern workforce challenges while keeping the interface simple and efficient.',
  },
];

const accountMoments = [
  {
    heading: 'Account cockpit',
    detail: 'Set roles, locations, and access rights visually. Managers only see what belongs to their crew.',
  },
  {
    heading: 'Employee views',
    detail: 'Employees manage profile, availability, and requests using calm, mobile-friendly flows.',
  },
  {
    heading: 'Security layers',
    detail: 'Supabase Row Level Security, email verification, and audit trails come standard.',
  },
];

const contactChannels = [
  {
    label: 'Demo hotline',
    value: '+31 20 123 45 67',
  },
  {
    label: 'MoofPlanning desk',
    value: 'ops@moofplanner.com',
  },
  {
    label: 'Discord crew',
    value: 'discord.gg/moofplanner',
  },
];

const socialLinks = ['LinkedIn', 'YouTube', 'Instagram', 'Discord'];
const overlayLinks = navLinks;

export default function LandingPageClient() {
  const revealRefs = useRef<HTMLElement[]>([]);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navPinned, setNavPinned] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('Home');

  useEffect(() => {
    const doc = document.documentElement;
    const handleScroll = () => {
      const docHeight = doc.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? window.scrollY / docHeight : 0);
      setNavPinned(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);
  

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    revealRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;
    const handlePointer = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
      node.style.setProperty('--tilt-x', `${y}deg`);
      node.style.setProperty('--tilt-y', `${x}deg`);
    };
    node.addEventListener('mousemove', handlePointer);
    return () => node.removeEventListener('mousemove', handlePointer);
  }, []);

  const registerReveal = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  useEffect(() => {
    const sectionMap = navLinks.map((link) => {
      const id = link.href.replace('#', '');
      return {
        label: link.label,
        element: typeof document !== 'undefined' ? document.getElementById(id) : null,
      };
    });

    const handleSectionChange = () => {
      const midpoint = window.scrollY + window.innerHeight / 2;
      let current = navLinks[0]?.label ?? 'Home';

      sectionMap.forEach((section) => {
        if (!section.element) return;
        if (midpoint >= section.element.offsetTop) {
          current = section.label;
        }
      });

      setActiveNav(current);
    };

    handleSectionChange();
    window.addEventListener('scroll', handleSectionChange, { passive: true });
    return () => window.removeEventListener('scroll', handleSectionChange);
  }, []);

  return (
    <div className="bg-[#0C1208] text-white">
      <CursorController />
      <section
        id="hero"
        className="relative min-h-screen overflow-hidden neon-hero"
        style={{ backgroundPositionY: `${scrollProgress * 220}px` }}
      >
        <div className="hero-noise" />
        <div className="hero-rings" />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-5 pb-16 pt-24 sm:px-8">
          <nav className={`nav-shell ${menuOpen ? 'nav-shell--overlay' : navPinned ? 'nav-shell--pinned' : 'nav-shell--top'}`}>
            <MoofPlannerLogo compact className="text-white" />
            <div className="flex gap-3">
              <Link href="/login" className={`${plusJakarta.className} store-pill`}>Sign up</Link>
              <button
                type="button"
                className={`menu-button ${menuOpen ? 'is-open' : ''}`}
                aria-label="Open menu"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <span />
                <span />
              </button>
            </div>
          </nav>

          {menuOpen && (
            <div className="nav-overlay">
              <div className={`${spaceGrotesk.className} nav-overlay__links`}>
                {overlayLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`nav-overlay__link ${link.label === activeNav ? 'is-active' : ''}`}
                    onClick={() => {
                      setActiveNav(link.label);
                      setMenuOpen(false);
                    }}
                  >
                    <span className="nav-overlay__text">
                      {link.label.split('').map((char, idx) => (
                        <span
                          key={`${link.label}-${idx}`}
                          className="nav-overlay__char"
                          style={{ ['--char-index' as string]: idx }}
                          data-char={char === ' ' ? '\u00A0' : char}
                        >
                          {char === ' ' ? '\u00A0' : char}
                        </span>
                      ))}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid flex-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-7 text-left">
              <h1 className={`${spaceGrotesk.className} text-4xl font-semibold leading-tight sm:text-6xl`}>
                All planning tools for{' '}
                <span style={{ color: '#D2FF00' }}>planners</span>,{' '}
                <span style={{ color: '#F4F7E0' }}>managers</span>{' '}
                and <span style={{ color: '#D2FF00' }}>employees</span>.
              </h1>
              <p className="max-w-2xl text-lg text-white/80">
                MoofPlanning bundles schedules, contracts, time tracking, and budgets into one serene cockpit. Automation and data-driven insights keep everyone aligned while the experience stays human.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="#pricing" className="cta-primary">See pricing</Link>
                <Link href="#about" className="cta-secondary text-contrast">Discover concept</Link>
              </div>
            </div>

            <div ref={heroRef} className="hero-sigil">
              <div className="hero-sigil__glow" />
              <div className="hero-sigil__photo" />
              <div className="hero-sigil__signature">MoofPlanning</div>
              <div className="hero-sigil__caption">Central workspace</div>
            </div>
          </div>

          <div className="grid gap-5 rounded-[32px] border border-white/15 bg-white/5 p-6 text-left shadow-[0_30px_90px_rgba(4,6,20,0.55)] backdrop-blur md:grid-cols-3">
            {heroMetrics.map((metric) => (
              <div key={metric.label} ref={registerReveal} className="reveal-on-scroll fly-in-up opacity-0">
                <p className={`${plusJakarta.className} text-[0.6rem] uppercase tracking-[0.5em] text-white/60`}>{metric.label}</p>
                <p className={`${spaceGrotesk.className} mt-2 text-3xl font-semibold text-white`}>{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="manifesto-section">
        <div className="manifesto-overlay" />
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-20 text-center">
          {manifestoText.map((line) => (
            <p key={line} className={`${spaceGrotesk.className} manifesto-line`}>{line}</p>
          ))}
        </div>
      </section>

      <section className="bg-[#0F160B] py-20" id="pricing">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
          <div className="text-center">
            <p className={`${plusJakarta.className} text-sm uppercase tracking-[0.45em] text-white/70`}>Price</p>
            <h2 className={`${spaceGrotesk.className} mt-3 text-4xl font-semibold`}>Choose your grid.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pricePlans.map((plan, idx) => (
              <div
                key={plan.name}
                ref={registerReveal}
                className={`price-card reveal-on-scroll fly-in-up opacity-0 stagger`}
                style={{ ['--card-accent' as string]: plan.accent }}
              >
                <div className="price-card__badge">{plan.badge}</div>
                <h3 className={`${spaceGrotesk.className} text-3xl font-semibold`}>{plan.name}</h3>
                <p className="price-card__price">{plan.price}<span>{plan.cadence}</span></p>
                <ul className="space-y-2 text-white/75">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="h-2 w-2 rounded-full bg-[var(--card-accent)]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="plan-button">Start with {plan.name}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0C1208] py-20" id="about">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6">
          <div className="text-center">
            <p className={`${plusJakarta.className} text-sm uppercase tracking-[0.45em] text-white/70`}>About</p>
            <h2 className={`${spaceGrotesk.className} mt-2 text-4xl font-semibold`}>What is MoofPlanner?</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {aboutPillars.map((pillar, idx) => (
              <div
                key={pillar.title}
                ref={registerReveal}
                className={`reveal-on-scroll concept-card opacity-0 ${idx % 2 === 0 ? 'fly-in-left' : 'fly-in-right'}`}
              >
                <h3 className={`${spaceGrotesk.className} text-2xl font-semibold`}>{pillar.title}</h3>
                <p className="mt-2 text-sm text-white/70">{pillar.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0F160B] py-20" id="account">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
          <div className="text-center">
            <p className={`${plusJakarta.className} text-sm uppercase tracking-[0.45em] text-white/70`}>Account Flow</p>
            <h2 className={`${spaceGrotesk.className} mt-2 text-4xl font-semibold`}>Accounts, roles and security in one motion layer.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {accountMoments.map((moment, idx) => (
              <div
                key={moment.heading}
                ref={registerReveal}
                className={`account-card reveal-on-scroll opacity-0 ${idx === 1 ? 'fly-in-down' : idx === 2 ? 'fly-in-right' : 'fly-in-left'}`}
              >
                <h3 className={`${spaceGrotesk.className} text-2xl font-semibold`}>{moment.heading}</h3>
                <p className="mt-2 text-sm text-white/70">{moment.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-ripple" />
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-16 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className={`${plusJakarta.className} text-sm uppercase tracking-[0.45em] text-[#121b0d]`}>Contact</p>
            <h3 className={`${spaceGrotesk.className} mt-2 text-4xl font-semibold text-[#121b0d]`}>Get in touch with the MoofPlanning desk.</h3>
            <p className="mt-3 text-[#121b0d]/80">
              Request a demo, onboard your account, or sync with our operations crew. We reply within one business day.
            </p>
          </div>
          <div className="grid gap-4">
            {contactChannels.map((channel, idx) => (
              <div
                key={channel.label}
                ref={registerReveal}
                className={`contact-card reveal-on-scroll opacity-0 ${idx % 2 === 0 ? 'fly-in-left' : 'fly-in-right'}`}
              >
                <p className={`${plusJakarta.className} text-xs uppercase tracking-[0.4em] text-[#121b0d]/70`}>{channel.label}</p>
                <p className={`${spaceGrotesk.className} text-2xl font-semibold text-[#121b0d]`}>{channel.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#1A2814] via-[#111a0f] to-[#0F160B] py-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`${plusJakarta.className} text-sm uppercase tracking-[0.4em] text-white/70`}>Ready</p>
            <h4 className={`${spaceGrotesk.className} mt-2 text-3xl font-semibold`}>Switch to effortless schedules <span style={{ color: '#D2FF00' }}>today</span>.{' '}</h4>
          </div>
          <div className={`flex flex-wrap gap-3 md:flex-nowrap ${plusJakarta.className}`}>
            <Link
              href="/login"
              className="rounded-full border border-white/20 bg-white px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#111a0f] transition hover:bg-[#D2FF00] whitespace-nowrap"
            >
              Create account
            </Link>
            <Link
              href="/contact"
              className="outline-button rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white whitespace-nowrap"
            >
              Contact sales
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#0A0F07] py-10 text-sm text-white/70">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
          <MoofPlannerLogo compact className="text-white" />
          <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.4em]">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
