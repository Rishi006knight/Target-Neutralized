import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'OceanShield OPS — Maritime Piracy Monitor',
  description:
    'Real-time vessel tracking and anomaly detection system for maritime piracy monitoring. Powered by AIS data, ML-driven threat analysis, and SAR satellite imagery.',
  keywords: ['maritime', 'piracy', 'AIS', 'vessel tracking', 'anomaly detection', 'SAR'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-slate-950 text-slate-200`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}