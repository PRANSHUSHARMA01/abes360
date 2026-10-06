'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TimetableGrid } from '@/components/TimetableGrid';
import { OnboardingModal } from '@/components/OnboardingModal';
import { DataService } from '@/lib/data-service';
import { TimetableSlot, Branch } from '@/lib/types';
import { SlidersHorizontal } from 'lucide-react';

export default function TimetablePage() {
  const [branchId, setBranchId] = useState('b-cse');
  const [semester, setSemester] = useState(3);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    const prefs = DataService.getUserPreferences();
    if (prefs) {
      setBranchId(prefs.branch_id);
      setSemester(prefs.semester);
    }
    DataService.getBranches().then(setBranches);
  }, []);

  useEffect(() => {
    const load = async () => setSlots(await DataService.getTimetableSlots(branchId, semester));
    load();
    const unsubscribe = DataService.subscribeToTimetable(branchId, semester, load);
    return () => unsubscribe();
  }, [branchId, semester]);

  const branch = branches.find((item) => item.id === branchId);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <div>
        <Navbar onOpenOnboarding={() => setIsOnboardingOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="apple-eyebrow">Schedule</p>
              <h1 className="mt-1 text-4xl font-semibold tracking-tight text-zinc-950">Timetable</h1>
              <p className="mt-2 text-sm text-zinc-500">{branch?.code || 'CSE'} · Semester {semester}</p>
            </div>
            <button onClick={() => setIsOnboardingOpen(true)} className="apple-secondary-button">
              <SlidersHorizontal className="h-4 w-4" /> Change branch / semester
            </button>
          </div>
          <TimetableGrid slots={slots} branchCode={branch?.code} semester={semester} />
        </main>
      </div>
      <Footer />
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSaved={(b, s) => { setBranchId(b); setSemester(s); }}
      />
    </div>
  );
}
