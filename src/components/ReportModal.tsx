'use client';

import React, { useState } from 'react';
import { Note } from '@/lib/types';
import { DataService } from '@/lib/data-service';
import { AlertTriangle, CheckCircle2, Flag, Loader2, X } from 'lucide-react';

interface ReportModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ note, isOpen, onClose }) => {
  const [reason, setReason] = useState<'incorrect_content' | 'copyright_violation' | 'poor_quality' | 'wrong_subject' | 'other'>('incorrect_content');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !note) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Rate limiting: check recent reports in localStorage (max 5 per 10 mins)
    const recentReportsKey = 'clasy_report_timestamps';
    try {
      const timestamps: number[] = JSON.parse(localStorage.getItem(recentReportsKey) || '[]');
      const tenMinsAgo = Date.now() - 10 * 60 * 1000;
      const recent = timestamps.filter((t) => t > tenMinsAgo);
      if (recent.length >= 5) {
        setError('You have submitted too many reports recently. Please wait a few minutes before trying again.');
        return;
      }
      recent.push(Date.now());
      localStorage.setItem(recentReportsKey, JSON.stringify(recent));
    } catch {
      // ignore
    }

    if (!details.trim()) {
      setError('Please provide a brief description of the issue.');
      return;
    }

    setIsSubmitting(true);
    try {
      await DataService.submitReport({
        note_id: note.id,
        note_title: note.title,
        reason,
        details: details.trim(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDetails('');
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Flag className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950">Report Note</h3>
              <p className="text-xs text-zinc-500 truncate max-w-[220px]">{note.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
            aria-label="Close report modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center animate-in fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-zinc-950">Report Received</h4>
            <p className="mt-1 text-xs text-zinc-500">Thank you for keeping Clasy accurate and helpful.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-xs text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Issue Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none"
              >
                <option value="incorrect_content">Incorrect / Outdated Syllabus</option>
                <option value="copyright_violation">Copyright / DMCA Violation</option>
                <option value="poor_quality">Unreadable / Broken File</option>
                <option value="wrong_subject">Wrong Subject / Wrong Unit</option>
                <option value="other">Other Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Details
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what is wrong with this document so the moderation team can review it..."
                rows={3}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="apple-secondary-button flex-1 justify-center py-2.5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="apple-primary-button flex-1 justify-center py-2.5 text-xs font-semibold disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
