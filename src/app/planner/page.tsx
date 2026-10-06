'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { StudyPlanner } from '@/components/StudyPlanner';
import { MandatoryAuthModal } from '@/components/MandatoryAuthModal';
import { DataService } from '@/lib/data-service';
import { AuthUser } from '@/lib/types';

export default function PlannerPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    DataService.getCurrentUser().then((u) => {
      setUser(u);
      if (!u) {
        setAuthModalOpen(true);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          <StudyPlanner />
        </main>
      </div>

      <Footer />

      <MandatoryAuthModal
        isOpen={authModalOpen}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          setAuthModalOpen(false);
        }}
        title="Sign In to Sync Your Study Planner"
        subtitle="Sign in with your Google Account (Gmail / Google ID) to track topic progress, exam preparation and study schedules across devices."
      />
    </div>
  );
}
