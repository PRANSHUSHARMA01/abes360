import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://clasy-tau.vercel.app'),
  title: {
    default: 'ABESNOTES — College Timetable & 5-Unit Notes',
    template: '%s | ABESNOTES',
  },
  description: 'Live college timetable and 5-unit study notes library for ABES students. Track live classes, open PDF notes.',
  keywords: [
    'abesnotes',
    'ABES notes',
    'college timetable',
    'CSE semester 3 notes',
    'study notes',
    'in-app note viewer',
    'abesnotes app',
  ],
  authors: [{ name: 'ABESNOTES Team' }],
  creator: 'ABESNOTES',
  publisher: 'ABESNOTES',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ABESNOTES',
  },
  openGraph: {
    title: 'ABESNOTES — College Timetable & 5-Unit Notes',
    description: 'Track live classes, schedules, and read 5-unit notes directly in the app.',
    url: 'https://clasy-tau.vercel.app',
    siteName: 'ABESNOTES',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ABESNOTES — College Timetable & 5-Unit Notes',
    description: 'College, simplified. Live timetable and 5-unit notes.',
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
  name: 'ABESNOTES — College Timetable & 5-Unit Notes',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  description: 'Live college timetable schedule and 5-unit study notes library for engineering students.',
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
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
