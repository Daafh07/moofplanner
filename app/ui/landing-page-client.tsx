'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BoltIcon } from '@heroicons/react/24/outline';
import MoofPlannerLogo from '@/app/ui/moofplanner-logo';
import { spaceGrotesk, plusJakarta } from '@/app/ui/fonts';

const navLinks = [
  { label: 'Price', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
  { label: 'Account', href: '#account' },
];

const heroMetrics = [
  { label: 'Companies trusting us', value: '10+' },
  { label: 'Hours saved', value: '200+' },
  { label: 'Reduce planning mistakes by', value: '60%' },
];

const manifestoText = [
  'Redefining workforce calm.',
  'No messy schedules.',
  'Clarity for every shift.',
  'Clocking system, no stress.',
];

const pricePlans = [
  {
    name: 'Basic Plan',
    price: '€49',
    cadence: 'Company / Month',
    features: ['Planning system', 'Schedule availability', 'Live cost estimate', 'Up to 20 employees'],
    badge: 'Most adopted',
    accent: '#D2FF00',
  },
  {
    name: 'Next Step',
    price: '€89',
    cadence: 'per gebruiker / maand',
    features: ['Scheduling together', 'Multiple schedules', 'Clocking system', 'Up to 75 employees'],
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
    title: 'Automate & Humanize',
    copy: 'MoofPlanner combines automation with human-centred flows. Managers feel supported, not replaced.',
  },
  {
    title: 'Data-driven Insights',
    copy: 'Real-time dashboards show labor costs, contract hours, and open shifts before they become an issue.',
  },
  {
    title: 'Moof DNA',
    copy: 'Built as a modern solution for today’s workforce challenges, MoofPlanner embodies our commitment to simplicity and efficiency.',
  },
];

const accountMoments = [
  {
    heading: 'Account cockpit',
    detail: 'You can set roles, locations, and access rights visually. Managers only see what belongs to their crew.',
  },
  {
    heading: 'Employee views',
    detail: 'Employees manage their profile, availability, and requests through mobile gestures and micro-animations.',
  },
  {
    heading: 'Security layers',
    detail: 'Supabase Row Level Security, email verification, and audit trails are enabled by default.',
  },
];

const contactChannels = [
  {
    label: 'Demo Hotline',
    value: '+31 20 123 45 67',
  },
  {
    label: 'MoofPlanning Desk',
    value: 'ops@moofplanner.com',
  },
  {
    label: 'Discord Crew',
    value: 'discord.gg/moofplanner',
  },
];

const socialLinks = ['LinkedIn', 'YouTube', 'Instagram', 'Discord'];

export default function LandingPageClient() {
  const revealRefs = useRef<HTMLElement[]>([]);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navPinned, setNavPinned] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;

    const animate = () => {
      currentX += (targetX - currentX) * 0.25;
      currentY += (targetY - currentY) * 0.25;
      document.documentElement.style.setProperty('--cursor-x', `${currentX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${currentY}px`);
      rafId = requestAnimationFrame(animate);
    };

    const setTarget = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      document.documentElement.style.setProperty('--cursor-visible', '1');
      if (rafId === null) rafId = requestAnimationFrame(animate);
    };

    const hideCursor = () => {
      document.documentElement.style.setProperty('--cursor-visible', '0');
    };

    window.addEventListener('pointermove', setTarget, { passive: true });
    window.addEventListener('pointerdown', setTarget, { passive: true });
    window.addEventListener('pointerenter', setTarget, { passive: true });
    window.addEventListener('pointerleave', hideCursor);
    window.addEventListener('blur', hideCursor);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', setTarget);
      window.removeEventListener('pointerdown', setTarget);
      window.removeEventListener('pointerenter', setTarget);
      window.removeEventListener('pointerleave', hideCursor);
      window.removeEventListener('blur', hideCursor);
    };
  }, []);

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

  return (
    <div className="bg-[#0C1208] text-white">
      <section
        className="relative min-h-screen overflow-hidden neon-hero"
        style={{ backgroundPositionY: `${scrollProgress * 220}px` }}
      >
        <div className="hero-noise" />
        <div className="hero-rings" />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-5 pb-16 pt-24 sm:px-8">
          <nav className={`nav-shell ${navPinned ? 'nav-shell--pinned' : 'nav-shell--top'}`}>
            <MoofPlannerLogo compact className="text-white" />
            <div className="flex gap-3">
              <Link href="/login" className={`${plusJakarta.className} store-pill`}>Aanmelden</Link>
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
                {navLinks.map((link, index) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`nav-overlay__link ${index === 0 ? 'is-active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid flex-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-7 text-left">
              <h1 className={`${spaceGrotesk.className} text-4xl font-semibold leading-tight sm:text-6xl`}>
                All planning tools for <span className="text-[#D2FF00]">planners</span>, <span className="text-[#F4F7E0]">managers</span> and <span className="text-[#D2FF00]">employees</span>.
              </h1>
              <p className="max-w-2xl text-lg text-white/80">
                MoofPlanning bundelt roosters, contracten, urenregistratie en budgetbewaking in één serene cockpit. Automatisering en data-gedreven inzichten houden iedereen up-to-date, terwijl de UX menselijk en rustig blijft.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="#pricing" className="cta-primary">See pricing</Link>
                <Link href="#about" className="cta-secondary">Discover concept</Link>
              </div>
            </div>

            <div ref={heroRef} className="hero-sigil">
              <div className="hero-sigil__glow" />
              <div className="hero-sigil__photo" />
              <div className="hero-sigil__signature">MoofPlanning</div>
              <div className="hero-sigil__caption">Centrale workspace</div>
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
            <h2 className={`${spaceGrotesk.className} mt-3 text-4xl font-semibold`}>Kies jouw grid.</h2>
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
                <Link href="/login" className="plan-button">Start met {plan.name}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0C1208] py-20" id="about">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-6">
          <div className="text-center">
            <p className={`${plusJakarta.className} text-sm uppercase tracking-[0.45em] text-white/70`}>About</p>
            <h2 className={`${spaceGrotesk.className} mt-2 text-4xl font-semibold`}>Wat is MoofPlanner?</h2>
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
            <h2 className={`${spaceGrotesk.className} mt-2 text-4xl font-semibold`}>Accounts, rollen en beveiliging in één motion layer.</h2>
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
            <h3 className={`${spaceGrotesk.className} mt-2 text-4xl font-semibold text-[#121b0d]`}>Neem contact op met de MoofPlanning desk.</h3>
            <p className="mt-3 text-[#121b0d]/80">
              Vraag een demo, laat je account onboarden of sync met ons operations-team. Wij reageren binnen één werkdag.
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
            <h4 className={`${spaceGrotesk.className} mt-2 text-3xl font-semibold`}>Schakel vandaag over naar moeiteloze roosters.</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="rounded-full bg-white px-6 py-3 text-[#111a0f] transition hover:bg-[#D2FF00]">
              Account aanmaken
            </Link>
            <Link href="/contact" className="rounded-full border border-white px-6 py-3 text-white transition hover:border-[#D2FF00] hover:text-[#D2FF00]">
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
