import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, Lock, EyeOff, Database, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Clasy Privacy Policy: Plain-language explanation of our student data protection and zero-tracking philosophy.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>

          <div className="rounded-3xl bg-white p-8 sm:p-12 shadow-sm border border-zinc-200/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Privacy Policy</h1>
                <p className="text-xs text-zinc-400 mt-0.5">Last updated: October 2026 · Plain language for students</p>
              </div>
            </div>

            <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-600">
              <div className="rounded-2xl bg-blue-50/50 p-4 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                <strong>Notice for Users &amp; Administrators:</strong> This policy is a clear template explaining how Clasy treats your data. Clasy is built on a <strong>privacy-first, offline-ready architecture</strong>. We do not sell data or track you across the web.
              </div>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" /> 1. What Data We Collect &amp; Store
                </h2>
                <p>
                  To provide you with your college timetable and in-app notes without unnecessary friction, Clasy stores:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-700">
                  <li><strong>Local Preferences:</strong> Your selected branch (e.g., CSE, CSE-AIML, CSE-DS) and semester number stored on your local browser (LocalStorage).</li>
                  <li><strong>Cached Study Materials:</strong> Note metadata and cached offline documents stored via Service Worker cache so you can read notes even during network drops.</li>
                  <li><strong>Reports &amp; Feedback:</strong> If you submit a note issue report or feedback message, the report text and timestamp are recorded to help administrators address syllabus errors.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-purple-600" /> 2. What We Do NOT Collect
                </h2>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-700">
                  <li>No third-party tracking pixels (No Facebook pixel, No Google AdSense, No behavioural fingerprinting).</li>
                  <li>No device location access or intrusive permissions.</li>
                  <li>No personal identity requirement for general students reading public timetable and notes.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-600" /> 3. Data Storage &amp; Cloudflare R2
                </h2>
                <p>
                  Notes files are securely distributed using Cloudflare R2 object storage with time-limited presigned URLs (`inline=true`) allowing you to read them directly inside the web application without forced downloads.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-red-600" /> 4. Your Rights: Export &amp; Delete
                </h2>
                <p>
                  You are in full control of your data on this device:
                </p>
                <p>
                  You can use the <strong>&ldquo;Export My Data&rdquo;</strong> button in the footer at any time to receive a raw JSON copy of all locally stored preferences and submitted reports. You can also click <strong>&ldquo;Reset Local Storage&rdquo;</strong> to completely erase all local records.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-zinc-900">5. Contact &amp; Questions</h2>
                <p>
                  If you have privacy inquiries or DMCA inquiries regarding note content, please visit our{' '}
                  <Link href="/contact" className="font-semibold text-blue-600 underline">
                    Contact Page
                  </Link>.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
