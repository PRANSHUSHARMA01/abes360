'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { NotesCatalog } from '@/components/NotesCatalog';
import { OnboardingModal } from '@/components/OnboardingModal';
import { DataService } from '@/lib/data-service';

export default function NotesPage() {
  const [branchId, setBranchId] = useState<string>('b-cse');
  const [semester, setSemester] = useState<number>(3);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  useEffect(() => {
    const prefs = DataService.getUserPreferences();
    if (prefs) {
      setBranchId(prefs.branch_id);
      setSemester(prefs.semester);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <div>
        <Navbar onOpenOnboarding={() => setIsOnboardingOpen(true)} />
        <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <NotesCatalog initialBranchId={branchId} initialSemester={semester} />
        </main>
      </div>

      <Footer />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSaved={(b, s) => {
          setBranchId(b);
          setSemester(s);
        }}
      />
    </div>
  );
}
