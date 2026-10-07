'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Check, School, Sparkles, X, Loader2, LogOut } from 'lucide-react';
import { DataService } from '@/lib/data-service';
import { Branch, AuthUser } from '@/lib/types';

export const OnboardingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSaved: (branchId: string, semester: number) => void;
}> = ({ isOpen, onClose, onSaved }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('b-cse');
  const [selectedSem, setSelectedSem] = useState(3);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    DataService.getBranches().then(setBranches);
    const prefs = DataService.getUserPreferences();
    if (prefs) {
      setSelectedBranch(prefs.branch_id);
      setSelectedSem(prefs.semester);
    }
    DataService.getCurrentUser().then(setUser);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await DataService.signInWithGoogle();
      const updated = await DataService.getCurrentUser();
      setUser(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await DataService.signOut();
    setUser(null);
  };

  const save = () => {
    DataService.setUserPreferences({ branch_id: selectedBranch, semester: selectedSem });
    onSaved(selectedBranch, selectedSem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-[32px] bg-white p-6 shadow-2xl sm:rounded-[32px] sm:p-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="apple-eyebrow">Welcome to ABESNOTES</p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight text-zinc-950">
                {user ? `Hi, ${user.name}` : 'Personalize Your Experience'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="apple-icon-button" aria-label="Close setup modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Google Authentication Section */}
        <div className="mt-5 rounded-2xl bg-zinc-50 p-4 border border-zinc-200/70">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt={user.name || 'User'} className="h-10 w-10 rounded-full border border-zinc-200 object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-sm">
                    {user.name?.[0] || 'S'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-zinc-900">{user.name}</p>
                  <p className="text-[11px] text-zinc-500 truncate max-w-[180px]">{user.email}</p>
                  <span className="inline-block mt-0.5 rounded-full bg-emerald-100 px-2 py-0.2 text-[9px] font-semibold text-emerald-800">
                    Logged in with Google
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Sign in with Google Account</h4>
                  <p className="text-[11px] text-zinc-500">Stay signed in, sync notes bookmarks &amp; class reminders.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-300 bg-white py-2.5 text-xs font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 active:scale-[0.99] transition disabled:opacity-50"
              >
                {signingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="apple-label flex items-center gap-2 mb-2">
              <School className="h-4 w-4 text-blue-600" /> Academic Branch
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch.id)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    selectedBranch === branch.id
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-sm'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <div className="text-sm font-bold">{branch.code}</div>
                  <div className="mt-0.5 text-[10px] text-zinc-500 line-clamp-1">
                    {branch.name.replace('Computer Science & Engineering — ', '')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="apple-label flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-purple-600" /> Current Semester
            </label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSem(sem)}
                  className={`rounded-2xl border py-2 text-xs font-bold transition ${
                    selectedSem === sem
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  Sem {sem}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={save}
          className="apple-primary-button mt-6 w-full justify-center py-3 text-sm font-semibold"
        >
          <Check className="h-4 w-4" /> Save &amp; Explore
        </button>
      </div>
    </div>
  );
};
