'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';
import { DataService } from '@/lib/data-service';

export const CookieBanner: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = DataService.getCookieConsent();
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    DataService.setCookieConsent(true);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="text-xs text-zinc-600 leading-relaxed">
            <span className="font-semibold text-zinc-900">Privacy-First App:</span> We only use essential local storage to remember your branch & semester preference and cached notes. No third-party ad trackers or profiling cookies are used.{' '}
            <Link href="/privacy" className="font-medium text-blue-600 underline hover:text-blue-700">
              Read Privacy Policy
            </Link>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-xl bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
