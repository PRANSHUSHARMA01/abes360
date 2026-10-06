import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FileCheck, BookOpen, AlertCircle, Scale, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service',
  description: 'Clasy Terms of Service: Academic usage guidelines, syllabus disclaimer, and educational copyright rules.',
};

export default function TermsPage() {
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
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Terms of Service</h1>
                <p className="text-xs text-zinc-400 mt-0.5">Last updated: October 2026 · Academic Guidelines</p>
              </div>
            </div>

            <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-600">
              <div className="rounded-2xl bg-amber-50/60 p-4 border border-amber-100 text-xs text-amber-900 leading-relaxed">
                <strong>Academic Disclaimer:</strong> Clasy is an independent student utility designed to make class timetables and educational notes accessible. Official college notices and syllabus updates from AKTU / ABES Engineering College department notice boards always take legal precedence.
              </div>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-600" /> 1. Educational Use Only
                </h2>
                <p>
                  All study materials, lecture notes, question banks, and timetable data hosted or referenced in Clasy are provided strictly for individual non-commercial educational use by engineering students.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Scale className="h-4 w-4 text-blue-600" /> 2. Copyright &amp; DMCA Compliance
                </h2>
                <p>
                  We respect the intellectual property rights of faculty, authors, and student contributors. If you are an author or faculty member and believe that any uploaded material violates copyright, you may use the <strong>&ldquo;Report Note&rdquo;</strong> button in the note viewer or submit a notice via the{' '}
                  <Link href="/contact" className="font-semibold text-blue-600 underline">
                    Contact Form
                  </Link>. Reported files are promptly inspected and removed if infringing.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" /> 3. Accuracy of Schedules
                </h2>
                <p>
                  While Clasy undergoes continuous updates to reflect the latest semester schedule (including room changes and lab group shifts), faculty rescheduling or emergency room shifts may occur. Clasy is not liable for missed lectures due to unexpected timetable changes.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-zinc-900">4. Prohibited Conduct</h2>
                <p>
                  Users agree not to attempt to disrupt the service, flood the storage endpoints, reverse-engineer administrative keys, or upload malicious files.
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
