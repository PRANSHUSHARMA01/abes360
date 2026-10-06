'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const NetworkStatus: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="sticky top-16 z-30 bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-white shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>You are offline · Showing cached timetable and offline study materials.</span>
      </div>
    </div>
  );
};
