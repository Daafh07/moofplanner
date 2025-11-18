import { Metadata } from 'next';
import LandingPageClient from '@/app/ui/landing-page-client';

export const metadata: Metadata = {
  title: 'MoofPlanner',
  description: 'Modern workforce planning platform to plan smarter and work better.',
};

export default function Page() {
  return <LandingPageClient />;
}
