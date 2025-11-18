'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import MoofPlannerLogo from '@/app/ui/moofplanner-logo';
import { useEffect, useRef } from 'react';

const howMoofWorks = [
  {
    title: 'Create schedules in minutes',
    description: 'Drag-and-drop shifts, automate templates, and resolve conflicts instantly.',
    icon: ClipboardDocumentListIcon,
  },
  {
    title: 'Track costs in real-time',
    description: 'Live labor budgets, contract hours, and overtime alerts across locations.',
    icon: CurrencyDollarIcon,
  },
  {
    title: 'One central place for everyone',
    description: 'Managers and employees share one calm hub for planning, swaps, and approvals.',
    icon: UsersIcon,
  },
];

const featureModules = [
  'Dashboard metrics',
  'Weekly schedule builder',
  'Contract hours meter',
  'Availability calendar',
  'Absence management',
  'Leave requests',
  'Shift swapping & open shifts',
  'Department roster view',
  'AI forecasting panel',
  'CSV / Excel export',
];

const roles = [
  {
    title: 'Employer / Planner',
    copy: 'Design budgets, departments, and reporting with perfect clarity.',
  },
  {
    title: 'Manager',
    copy: 'Approve leave, react to live signals, and keep every shift covered.',
  },
  {
    title: 'Employee',
    copy: 'Swap shifts, request time off, and update availability from any device.',
  },
];

const stats = [
  '35% faster scheduling',
  '100% secure data (Supabase RLS)',
  'Real-time cost overview',
  'AI-powered planning suggestions',
];

const testimonials = [
  {
    name: 'Northwind Produce',
    quote:
      '“We went from spreadsheets to a living, breathing plan. MoofPlanner keeps finance and ops in sync.”',
  },
  {
    name: 'Zeno Robotics',
    quote:
      '“Forecasting and contract alerts are crystal clear. Managers approve changes from anywhere.”',
  },
  {
    name: 'Citylane Retail',
    quote:
      '“Shift swaps, leave, and AI forecasting saved our managers hours every week.”',
  },
];

export default function LandingPageClient() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const floatRefs = useRef<HTMLImageElement[]>([]);
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const rotateY = ((event.clientX / innerWidth) - 0.5) * 6;
      const rotateX = ((event.clientY / innerHeight) - 0.5) * -6;
      floatRefs.current.forEach((node, index) => {
        if (!node) return;
        const depth = index * 4 + 8;
        node.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${depth}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const registerFloat = (el: HTMLImageElement | null) => {
    if (el && !floatRefs.current.includes(el)) {
      floatRefs.current.push(el);
    }
  };

  const registerReveal = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1F] text-white">
      <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0A0F1F] via-[#0C1224] to-[#1E88E5]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-20%,rgba(163,216,255,0.45),transparent_55%)] opacity-90" />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-5 pb-16 pt-10 sm:px-8">
          <nav className="flex flex-wrap items-center justify-between gap-4 rounded-full bg-white/90 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-gray-900 shadow-[0_30px_70px_rgba(0,0,0,0.4)] backdrop-blur">
            <MoofPlannerLogo compact className="text-gray-900" />
            <p className="hidden text-gray-500 sm:block">Best experienced in landscape</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/prices" className="rounded-full border border-gray-300 px-4 py-2 hover:bg-gray-100">
                See Plans
              </Link>
              <Link href="/login" className="rounded-full bg-black px-4 py-2 text-white hover:bg-gray-900">
                Sign up
              </Link>
            </div>
          </nav>

          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-white/70">MoofPlanner</p>
            <h1 className="text-4xl font-semibold sm:text-5xl md:text-6xl">Plan Smarter. Work Better.</h1>
            <p className="max-w-3xl text-lg text-white/80">
              The next-generation workforce planning tool for modern businesses. Forecast, schedule,
              and control labor from one calm, intuitive platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="rounded-full bg-[#1E88E5] px-8 py-3 text-white shadow-lg transition hover:-translate-y-1"
              >
                Start Free
              </Link>
              <Link
                href="#showcase"
                className="rounded-full border border-white/60 px-8 py-3 text-white transition hover:bg-white/10"
              >
                View Demo
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-5xl">
            <div className="relative h-[380px] w-full rounded-[40px] border border-white/20 bg-white/5 shadow-[0_45px_140px_rgba(2,4,12,0.65)] backdrop-blur">
              <Image
                ref={registerFloat}
                src="/hero-desktop.png"
                width={1400}
                height={860}
                alt="MoofPlanner dashboard"
                className="absolute inset-x-6 top-10 mx-auto w-[82%] rounded-[32px] shadow-[0_30px_80px_rgba(2,4,12,0.45)] animate-floating"
                priority
              />
              <Image
                ref={registerFloat}
                src="/hero-desktop.png"
                width={1200}
                height={720}
                alt="MoofPlanner schedule"
                className="absolute left-0 top-20 w-2/3 -translate-x-[18%] -rotate-3 rounded-[28px] opacity-80 shadow-[0_20px_70px_rgba(2,4,12,0.3)]"
              />
              <Image
                ref={registerFloat}
                src="/hero-mobile.png"
                width={500}
                height={900}
                alt="MoofPlanner mobile"
                className="absolute right-4 top-0 w-1/3 translate-x-[15%] rounded-[28px] shadow-[0_25px_80px_rgba(2,4,12,0.4)]"
              />
            </div>
            <div className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-4 rounded-[28px] bg-white/90 px-6 py-4 text-left text-slate-900 shadow-[0_25px_70px_rgba(2,4,12,0.45)] backdrop-blur md:flex-row md:items-center md:justify-between">
              {[
                { label: 'Hours saved / week', value: '18h' },
                { label: 'Labor cost coverage', value: '100%' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-semibold text-[#1E88E5]">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value proposition */}
      <section className="bg-[#0C1224] py-20" id="how">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
          <h2 className="text-3xl font-semibold">How MoofPlanner works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {howMoofWorks.map((step) => (
              <div
                key={step.title}
                ref={registerReveal}
                className="reveal-on-scroll group rounded-[28px] border border-white/10 bg-white/5 p-6 opacity-0 shadow-[0_25px_60px_rgba(0,0,0,0.45)] transition hover:-translate-y-2 hover:bg-white/10"
              >
                <step.icon className="h-10 w-10 text-[#A3D8FF]" />
                <p className="mt-6 text-xl font-semibold">{step.title}</p>
                <p className="mt-3 text-sm text-white/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature showcase */}
      <section className="bg-[#0A0F1F] py-20" id="features">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
          <h2 className="text-3xl font-semibold">Everything modern workforce planning needs.</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureModules.map((feature) => (
              <div
                key={feature}
                ref={registerReveal}
                className="reveal-on-scroll rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0C1224] to-[#1E88E5]/10 p-5 text-sm text-white/80 opacity-0 shadow-[0_25px_70px_rgba(0,0,0,0.4)] transition hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1E88E5]/25 text-white">
                    <BoltIcon className="h-6 w-6" />
                  </div>
                  <p className="text-base font-semibold text-white">{feature}</p>
                </div>
                <p className="mt-3 text-xs text-white/70">Built with neon-blue glow, parallax depth, and LN-style hover motion.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="bg-[#0C1224] py-20" id="roles">
        <div className="mx-auto flex w/full max-w-6xl flex-col gap-10 px-6">
          <h2 className="text-3xl font-semibold">For teams of every size.</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.title}
                ref={registerReveal}
                className="reveal-on-scroll rounded-[28px] border border-white/10 bg-white/5 p-6 opacity-0 shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#A3D8FF] opacity-70 blur-sm" />
                <p className="mt-6 text-xl font-semibold">{role.title}</p>
                <p className="mt-3 text-sm text-white/70">{role.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated stats */}
      <section className="overflow-hidden bg-[#0A0F1F] py-12">
        <div className="relative">
          <div className="animate-marquee flex gap-6 whitespace-nowrap text-sm uppercase tracking-[0.4em] text-white/80">
            {[...stats, ...stats].map((metric, idx) => (
              <span
                key={metric + idx}
                className="rounded-full border border-white/20 px-6 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              >
                {metric}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="bg-[#0C1224] py-20" id="showcase">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-white/80">Live overview</p>
            <h2 className="mt-2 text-3xl font-semibold">MoofPlanner showcase</h2>
          </div>
          <div className="relative rounded-[40px] border border-white/15 bg-gradient-to-b from-white/15 to-[#0A0F1F] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.5)]">
            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
              <div className="rounded-[32px] bg-white/90 p-4 shadow-[0_30px_80px_rgba(10,10,10,0.2)] tilt-card">
                <Image
                  src="/hero-desktop.png"
                  width={1400}
                  height={860}
                  alt="Dashboard preview"
                  className="w-full rounded-2xl"
                />
              </div>
              <div className="space-y-4">
                <div className="rounded-[24px] bg-white/80 p-4 shadow-lg tilt-card">
                  <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Forecasting</p>
                  <p className="mt-2 text-xl font-semibold text-[#0C1224]">$632k labor plan</p>
                  <p className="text-sm text-gray-600">
                    AI-powered scenario modeling keeps every department aligned.
                  </p>
                </div>
                <div className="rounded-[24px] bg-white/70 p-4 shadow-lg tilt-card">
                  <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Leave & shifts</p>
                  <p className="mt-2 text-xl font-semibold text-[#0C1224]">12 approvals</p>
                  <p className="text-sm text-gray-600">
                    Managers approve on mobile, employees stay in sync.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#0A0F1F] py-20" id="testimonials">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-white/70">Proof</p>
            <h3 className="mt-2 text-3xl font-semibold">Loved by teams who value clarity.</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                ref={registerReveal}
                className="reveal-on-scroll rounded-[28px] border border-[#1E88E5]/30 bg-gradient-to-br from-[#0C1224] to-[#0A0F1F] p-6 opacity-0 shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
              >
                <p className="text-lg font-semibold text-white">{testimonial.name}</p>
                <div className="my-3 h-px w-12 bg-gradient-to-r from-[#1E88E5] to-transparent" />
                <p className="text-sm text-white/70">{testimonial.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-[#1E88E5] to-[#0C1224] py-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/70">Start Planning Smarter Today.</p>
            <h4 className="mt-3 text-3xl font-semibold">Bring clarity to every shift, budget, and team.</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="rounded-full bg-white px-6 py-3 text-[#1E88E5] transition hover:bg-slate-100">
              Get Started Free
            </Link>
            <Link href="/contact" className="rounded-full border border-white px-6 py-3 text-white transition hover:bg-white/10">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050713] py-10 text-sm text-white/70">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
          <MoofPlannerLogo compact className="text-white" />
          <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.4em]">
            <Link href="/prices">Pricing</Link>
            <Link href="/login">Login</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
