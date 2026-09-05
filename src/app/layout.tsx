import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OCEANSHIELD 2.0 — Abyssal Threat Console',
  description:
    'Map-first maritime piracy investigation console. Real-time incident tracking, vessel AIS monitoring, ML threat correlation, and predictive risk windows.',
  keywords: ['maritime', 'piracy', 'threat', 'investigation', 'AIS', 'UKMTO', 'ReCAAP'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${plexSans.variable} ${plexMono.variable} font-sans antialiased`}
        style={{ backgroundColor: '#03080D', color: '#C9D6DF' }}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}