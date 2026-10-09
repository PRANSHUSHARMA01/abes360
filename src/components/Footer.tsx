'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DataService } from '@/lib/data-service';
import { Download, Trash2, Check, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const [downloaded, setDownloaded] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleExportData = () => {
    const jsonStr = DataService.exportUserData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clasy-my-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear your local preferences, reports, and cached data? This will reset Clasy on this device.')) {
      DataService.clearUserData();
      setCleared(true);
      setTimeout(() => {
        setCleared(false);
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <footer className="border-t border-zinc-200/80 bg-white/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-icon.png" alt="ABES 360" className="h-7 w-7 object-contain" />
              <div className="text-base font-extrabold tracking-tight text-zinc-950 flex items-center">
                <span>ABES</span>
                <span className="text-blue-600 ml-1">360</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 max-w-sm">
              Live timetable tracking and 5-unit study notes library. College, simplified.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-zinc-500">
              <button
                onClick={handleExportData}
                className="inline-flex items-center gap-1.5 font-medium text-zinc-700 hover:text-blue-600 transition"
              >
                {downloaded ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Download className="h-3.5 w-3.5" />}
                {downloaded ? 'Data Downloaded' : 'Export My Data'}
              </button>
              <span>·</span>
              <button
                onClick={handleClearData}
                className="inline-flex items-center gap-1.5 font-medium text-zinc-700 hover:text-red-600 transition"
              >
                {cleared ? <Check className="h-3.5 w-3.5 text-red-600" /> : <Trash2 className="h-3.5 w-3.5" />}
                {cleared ? 'Cleared' : 'Reset Local Storage'}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Navigation</h3>
            <ul className="mt-4 space-y-2.5 text-xs font-medium text-zinc-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/timetable" className="hover:text-blue-600 transition">
                  Timetable
                </Link>
              </li>
              <li>
                <Link href="/notes" className="hover:text-blue-600 transition">
                  Notes &amp; 2nd Year Syllabus
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-blue-600 transition">
                  Changelog &amp; Updates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Legal &amp; Support</h3>
            <ul className="mt-4 space-y-2.5 text-xs font-medium text-zinc-600">
              <li>
                <Link href="/privacy" className="hover:text-blue-600 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-blue-600 transition">
                  Send Feedback
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600 transition">
                  Contact &amp; DMCA
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-blue-600 transition">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t border-zinc-100 pt-6 text-[11px] text-zinc-400 sm:flex-row">
          <p>© {new Date().getFullYear()} ABES 360. All rights reserved.</p>
          <div className="mt-2 flex items-center gap-1 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>for frictionless college days</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
