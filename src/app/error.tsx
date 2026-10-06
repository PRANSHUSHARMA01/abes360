'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Clasy runtime error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f7] px-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600 shadow-sm">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-zinc-500">
        We encountered an unexpected issue. Don&apos;t worry, your offline timetable and notes are safe.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button onClick={() => reset()} className="apple-primary-button">
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
        <Link href="/" className="apple-secondary-button">
          <Home className="h-4 w-4" /> Return Home
        </Link>
      </div>
    </div>
  );
}
