'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MessageSquarePlus, Bug, Lightbulb, Sparkles, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { DataService } from '@/lib/data-service';

export default function FeedbackPage() {
  const [type, setType] = useState<'bug' | 'idea' | 'improvement' | 'other'>('idea');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      await DataService.submitFeedback({
        type,
        message: message.trim(),
        contact_email: email.trim() || undefined,
      });
      setSubmitted(true);
      setMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const types = [
    { id: 'idea', label: 'Feature Idea', icon: Lightbulb, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-600 bg-red-50 border-red-200' },
    { id: 'improvement', label: 'Improvement', icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>

          <div className="rounded-3xl bg-white p-8 shadow-sm border border-zinc-200/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <MessageSquarePlus className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Student Feedback</h1>
                <p className="text-xs text-zinc-400 mt-0.5">Help us shape the future of Clasy for ABES</p>
              </div>
            </div>

            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold text-zinc-950">Thank You!</h2>
                <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
                  Your feedback has been logged. We use student suggestions directly in every semester update.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="apple-secondary-button mt-6 text-xs"
                >
                  Send More Feedback
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                    Feedback Category
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {types.map((t) => {
                      const Icon = t.icon;
                      const isSelected = type === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setType(t.id as any)}
                          className={`flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-xs font-semibold transition ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Your Thoughts &amp; Experience
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what feature you would love, or describe an issue you encountered..."
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@gmail.com (if you'd like a follow-up)"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="apple-primary-button w-full justify-center py-3 text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
