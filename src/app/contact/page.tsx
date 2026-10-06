'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Mail, MessageSquare, Send, CheckCircle2, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-6 md:col-span-1">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Get in Touch</h1>
                <p className="mt-2 text-sm text-zinc-500">
                  Have questions, copyright concerns, or want to contribute notes for your branch?
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-zinc-200/80 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900">Direct Support</h3>
                    <p className="text-xs text-zinc-500">clasy.abes@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900">DMCA / Takedowns</h3>
                    <p className="text-xs text-zinc-500">Reviewed within 24–48 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900">Community</h3>
                    <p className="text-xs text-zinc-500">ABES Engineering College, Ghaziabad</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-zinc-200/80">
                {submitted ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-950">Message Received!</h2>
                    <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
                      Thank you for reaching out. We will review your inquiry shortly.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setMessage(''); }}
                      className="apple-secondary-button mt-6 text-xs"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" /> Send a Message
                    </h2>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Your Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@gmail.com"
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Subject
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                      >
                        <option value="general">General Question</option>
                        <option value="syllabus">Syllabus / Room Correction</option>
                        <option value="notes_contribution">Contribute New Notes</option>
                        <option value="dmca">DMCA / Copyright Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Message
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your inquiry or notes contribution..."
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="apple-primary-button w-full justify-center py-3 text-sm font-semibold"
                    >
                      <Send className="h-4 w-4" /> Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
