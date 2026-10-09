'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, FileText, Home, Lock, Menu, X, ChevronDown, Download, User, BookOpen } from 'lucide-react';
import { DataService } from '@/lib/data-service';
import { Branch, AuthUser } from '@/lib/types';

interface NavbarProps { 
  onOpenOnboarding?: () => void; 
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOnboarding }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('b-cse');
  const [selectedSem, setSelectedSem] = useState(3);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    DataService.getBranches().then((list) => {
      setBranches(list);
      const prefs = DataService.getUserPreferences();
      if (prefs) {
        setSelectedBranch(prefs.branch_id);
        setSelectedSem(prefs.semester);
      }
    });

    DataService.getCurrentUser().then(setUser);
    const unsubscribeAuth = DataService.onAuthStateChange(setUser);

    const handleBeforeInstall = (e: any) => { 
      e.preventDefault(); 
      setDeferredPrompt(e); 
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      unsubscribeAuth();
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install Clasy on iOS: tap Share → Add to Home Screen. On Chrome/Android: click the Install icon in the browser address bar.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const selectedBranchCode = branches.find((branch) => branch.id === selectedBranch)?.code || 'CSE';
  
  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/timetable', label: 'Timetable', icon: CalendarDays },
    { href: '/notes', label: 'Notes & Syllabus', icon: FileText },
    { href: '/admin/dashboard', label: 'Admin', icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo-icon.png" 
            alt="ABES 360" 
            className="h-9 w-9 object-contain drop-shadow-sm transition hover:scale-105" 
          />
          <div>
            <div className="text-[18px] font-extrabold tracking-tight text-zinc-950 flex items-center">
              <span>ABES</span>
              <span className="text-blue-600 ml-1">360</span>
            </div>
            <div className="hidden text-[10px] font-medium text-zinc-400 sm:block -mt-0.5">your college, simplified</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link 
                key={href} 
                href={href} 
                className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active 
                    ? 'bg-zinc-900 text-white shadow-sm' 
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 sm:flex">
          <button 
            onClick={onOpenOnboarding} 
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 transition"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {selectedBranchCode} · Sem {selectedSem}
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>

          {user ? (
            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/60 py-1.5 pl-1.5 pr-3 text-xs font-semibold text-blue-950 hover:bg-blue-100/70 transition"
              title="View Account"
            >
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.name || 'User'} className="h-6 w-6 rounded-full border border-blue-200 object-cover" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-[10px]">
                  {user.name?.[0] || 'S'}
                </div>
              )}
              <span className="truncate max-w-[90px]">{user.name?.split(' ')[0] || 'Account'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 transition"
            >
              <User className="h-3.5 w-3.5 text-zinc-500" /> Sign In
            </button>
          )}

          {!isInstalled && (
            <button onClick={handleInstallClick} className="apple-secondary-button text-xs py-2 px-3">
              <Download className="h-3.5 w-3.5" /> App
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <button 
            onClick={onOpenOnboarding} 
            className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700"
          >
            {user ? user.name?.split(' ')[0] : `${selectedBranchCode} · S${selectedSem}`}
          </button>
          <button 
            onClick={() => setMobileMenuOpen((open) => !open)} 
            className="apple-icon-button"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-zinc-200 bg-white px-4 py-3 md:hidden shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link 
                key={href} 
                href={href} 
                onClick={() => setMobileMenuOpen(false)} 
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                  pathname === href ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-3 border-t border-zinc-100 pt-3 space-y-2">
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenOnboarding?.(); }}
              className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold text-zinc-800"
            >
              <span>{user ? `Signed in as ${user.name}` : 'Sign in / Setup Academics'}</span>
              <span className="text-blue-600 font-bold">{selectedBranchCode} · Sem {selectedSem}</span>
            </button>

            {!isInstalled && (
              <button onClick={handleInstallClick} className="apple-primary-button w-full justify-center text-xs">
                <Download className="h-4 w-4" /> Install Clasy on Device
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
