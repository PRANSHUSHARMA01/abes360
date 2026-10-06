'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CurrentClassBanner } from '@/components/CurrentClassBanner';
import { OnboardingModal } from '@/components/OnboardingModal';
import { DataService } from '@/lib/data-service';
import { TimetableSlot, Branch } from '@/lib/types';
import { ArrowRight, CalendarDays, FileText, BookOpen } from 'lucide-react';
import Link from 'next/link';

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

import { Footer } from '@/components/Footer';

export default function HomePage() {
  const [branchId, setBranchId] = useState('b-cse');
  const [semester, setSemester] = useState(3);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const prefs = DataService.getUserPreferences();
    if (prefs) {
      setBranchId(prefs.branch_id);
      setSemester(prefs.semester);
    } else {
      setIsOnboardingOpen(true);
    }
    DataService.getBranches().then(setBranches);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => setSlots(await DataService.getTimetableSlots(branchId, semester));
    load();
    const unsubscribe = DataService.subscribeToTimetable(branchId, semester, load);
    return () => unsubscribe();
  }, [branchId, semester]);

  const currentBranchCode = branches.find((b) => b.id === branchId)?.code || 'CSE';
  const greeting = useMemo(() => getGreeting(now.getHours()), [now]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <div>
        <Navbar onOpenOnboarding={() => setIsOnboardingOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="mb-8">
            <p className="apple-eyebrow">Hi there 👋</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">{greeting}.</h1>
            <p className="mt-2 text-base text-zinc-500">Here&apos;s what&apos;s happening with your college day.</p>
          </section>

          <CurrentClassBanner slots={slots} />

          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/timetable" className="apple-card group p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-bold tracking-tight text-zinc-950">Timetable &amp; Live Status</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Check live class schedule for {currentBranchCode}, Semester {semester}, with room numbers and daily labs.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                Open timetable <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link href="/notes" className="apple-card group p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-bold tracking-tight text-zinc-950">Notes Library</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Read subject notes directly in the app without downloading. Categorized by unit.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600">
                Explore notes <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link href="/planner" className="apple-card group p-6 transition hover:-translate-y-0.5 hover:shadow-lg sm:col-span-2 lg:col-span-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-bold tracking-tight text-zinc-950">Study Planner &amp; Syllabus</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Official ABES 2026–27 5-unit syllabus, topic completion tracker, exam preparation &amp; study sessions.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                Open study planner <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </section>
        </main>
      </div>

      <Footer />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSaved={(id, sem) => { setBranchId(id); setSemester(sem); }}
      />
    </div>
  );
}
