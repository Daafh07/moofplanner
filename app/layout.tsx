import '@/app/ui/global.css';
import { inter, plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | MoofPlanner Dashboard',
    default: 'MoofPlanner Dashboard',
  },
  description: 'The official MoofPlanner Dashboard, create, manage and analyze your business with ease.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${plusJakarta.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
