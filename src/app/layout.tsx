import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://clasy-tau.vercel.app'),
  title: {
    default: 'Clasy — College Timetable & 5-Unit Notes',
    template: '%s | Clasy',
  },
  description: 'Live college timetable and 5-unit study notes library. Track live classes, open PDF notes.',
  keywords: [
    'college timetable',
    'college notes',
    'CSE semester 3 notes',
    'study notes',
    'in-app note viewer',
    'clasy app',
  ],
  authors: [{ name: 'Clasy Team' }],
  creator: 'Clasy',
  publisher: 'Clasy',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icons/icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Clasy',
  },
  openGraph: {
    title: 'Clasy — ABES College Timetable & 5-Unit Notes',
    description: 'Track live classes, schedules, and read 5-unit notes directly in the app.',
    url: 'https://clasy.app',
    siteName: 'Clasy',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clasy — ABES College Timetable & 5-Unit Notes',
    description: 'College, simplified. Live timetable and in-app 5-unit notes.',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

import { CookieBanner } from '@/components/CookieBanner';
import { NetworkStatus } from '@/components/NetworkStatus';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Clasy — ABES College Timetable & 5-Unit Notes',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  description: 'Live college timetable schedule and 5-unit study notes library for ABES engineering students.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        <NetworkStatus />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

