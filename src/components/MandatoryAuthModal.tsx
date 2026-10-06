'use client';

import React, { useState } from 'react';
import { DataService } from '@/lib/data-service';
import { Lock, Sparkles, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { AuthUser } from '@/lib/types';

interface MandatoryAuthModalProps {
  isOpen: boolean;
  onSuccess: (user: AuthUser) => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
}

export const MandatoryAuthModal: React.FC<MandatoryAuthModalProps> = ({
  isOpen,
  onSuccess,
  title = 'Sign In with Google Account',
  subtitle = 'Sign in with your personal or student Google Account (Gmail) to access notes, syllabus, and sync study targets.',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const email = emailInput.trim() || undefined;
      const res = await DataService.signInWithGoogle(email);
      if (res.error) {
        setError(res.error);
        return;
      }
      const user = await DataService.getCurrentUser();
      if (user) {
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-2xl animate-in zoom-in-95 duration-200 text-center border border-zinc-100">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 mb-4 shadow-inner">
          <Lock className="h-7 w-7" />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50/80 px-3 py-1 rounded-full w-fit mx-auto mb-2">
          <Sparkles className="h-3.5 w-3.5" /> Google Authentication
        </div>

        <h2 className="text-xl font-bold tracking-tight text-zinc-950">{title}</h2>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">{subtitle}</p>

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {showEmailInput && (
            <div className="text-left mb-2">
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Enter your Gmail address:</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full rounded-xl border border-zinc-300 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white py-3.5 px-4 text-sm font-bold text-zinc-800 shadow-md hover:bg-zinc-50 active:scale-[0.99] transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            ) : (
              <>
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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
                {showEmailInput ? 'Continue with this Google ID' : 'Sign in with Google Account'}
              </>
            )}
          </button>

          {!showEmailInput && (
            <button
              type="button"
              onClick={() => setShowEmailInput(true)}
              className="text-[11px] text-zinc-500 hover:text-blue-600 underline font-medium"
            >
              Sign in with custom Gmail address
            </button>
          )}
        </div>

        <div className="mt-6 border-t border-zinc-100 pt-4 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Persistent session · Zero spam · Localized for ABES EC</span>
        </div>
      </div>
    </div>
  );
};
