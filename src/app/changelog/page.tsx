import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CHANGELOG_DATA } from '@/lib/changelog';
import { Sparkles, Calendar, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Changelog & Updates',
  description: 'See the latest feature additions, improvements, and syllabus updates in Clasy.',
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              <Sparkles className="h-3.5 w-3.5" /> What&apos;s New
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">Changelog &amp; Release Notes</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Track real-time features, curriculum enhancements, and engine performance updates.
            </p>
          </div>

          <div className="space-y-6">
            {CHANGELOG_DATA.map((entry, index) => (
              <div key={entry.version} className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-zinc-200/80">
                <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-zinc-950">{entry.version}</span>
                    {entry.badge && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                        {entry.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {entry.date}
                  </div>
                </div>

                <h3 className="mt-4 text-base font-bold text-zinc-900">{entry.title}</h3>

                <ul className="mt-4 space-y-2.5">
                  {entry.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
