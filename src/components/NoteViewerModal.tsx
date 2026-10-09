'use client';

import React, { useEffect, useState } from 'react';
import { Note } from '@/lib/types';
import { getNoteDownloadUrl, getNoteViewUrl } from '@/lib/r2-client';
import { getSubjectShortform } from '@/lib/data-service';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Download, 
  ExternalLink, 
  BookOpen, 
  FileText, 
  Layers, 
  Share2, 
  Check, 
  AlertCircle,
  Calendar,
  Flag,
  ChevronLeft
} from 'lucide-react';
import { ReportModal } from './ReportModal';

interface NoteViewerModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NoteViewerModal: React.FC<NoteViewerModalProps> = ({ note, isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setIframeLoaded(false);
      setIframeError(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setIsFullscreen(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, note]);

  if (!isOpen || !note) return null;

  const fileName = note.file_path ? (note.file_path.split('/').pop() || `${note.title}.pdf`) : `${note.title}.pdf`;
  const fileExt = fileName.split('.').pop()?.toLowerCase() || 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(fileExt);
  const hasFile = Boolean(note.file_path && note.file_path.trim().length > 0);
  const viewUrl = hasFile ? getNoteViewUrl(note.file_path, fileName) : '';
  const downloadUrl = hasFile ? getNoteDownloadUrl(note.file_path, fileName) : '';

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-0 sm:p-4 md:p-6 backdrop-blur-md transition-all">
      <div 
        className={`relative flex flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 ${
          isFullscreen 
            ? 'h-full w-full rounded-none' 
            : 'h-[100dvh] w-full rounded-none sm:h-[92vh] sm:max-w-5xl sm:rounded-3xl'
        }`}
      >
        {/* Responsive Header Bar */}
        <header className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {/* Back button on mobile */}
            <button
              onClick={onClose}
              className="apple-icon-button sm:hidden -ml-1 text-zinc-700"
              aria-label="Back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-blue-700 shrink-0">
                  <Layers className="h-3 w-3" />
                  Unit {note.unit || 1}
                </span>
                <span className="truncate text-[11px] sm:text-xs text-zinc-500 font-medium">
                  {getSubjectShortform(note.subject || note.subject_id)}
                </span>
              </div>
              <h2 className="mt-0.5 truncate text-sm sm:text-base font-bold text-zinc-950">
                {note.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
            {hasFile && (
              <a 
                href={viewUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="apple-icon-button text-zinc-600" 
                title="Open PDF in new tab"
                aria-label="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {hasFile && (
              <a 
                href={downloadUrl} 
                className="apple-icon-button text-zinc-600" 
                title="Download note"
                aria-label="Download note"
              >
                <Download className="h-4 w-4" />
              </a>
            )}

            <button 
              onClick={handleShare} 
              className="apple-icon-button hidden sm:flex text-zinc-600" 
              title="Copy link"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            </button>

            <button 
              onClick={() => setIsReportOpen(true)} 
              className="apple-icon-button hidden sm:flex text-zinc-500 hover:text-amber-600" 
              title="Report note issue"
              aria-label="Report note"
            >
              <Flag className="h-4 w-4" />
            </button>

            <button 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              className="apple-icon-button hidden sm:flex text-zinc-600" 
              title={isFullscreen ? 'Exit full screen' : 'Full screen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button 
              onClick={onClose} 
              className="apple-icon-button hidden sm:flex hover:bg-zinc-100" 
              title="Close viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Viewer Content Canvas */}
        <main className="relative flex-1 overflow-hidden bg-zinc-100 flex flex-col justify-center">
          {hasFile ? (
            <div className="h-full w-full bg-white flex flex-col overflow-hidden">
              {isImage ? (
                <div className="flex h-full w-full items-center justify-center p-2 sm:p-4 overflow-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={viewUrl} 
                    alt={note.title} 
                    className="max-h-full max-w-full rounded-lg object-contain shadow-sm" 
                  />
                </div>
              ) : (
                <div className="relative h-full w-full flex flex-col">
                  {!iframeLoaded && !iframeError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-50/90 backdrop-blur-sm z-10">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <p className="text-xs sm:text-sm font-medium text-zinc-600">Loading PDF document...</p>
                    </div>
                  )}

                  {iframeError ? (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                      <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
                      <h3 className="text-base sm:text-lg font-semibold text-zinc-900">Preview PDF</h3>
                      <p className="mt-1 max-w-md text-xs sm:text-sm text-zinc-500">
                        Open the document in a full tab or download a copy to your phone.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="apple-primary-button text-xs">
                          <ExternalLink className="h-4 w-4" /> Open Full Screen
                        </a>
                        <a href={downloadUrl} className="apple-secondary-button text-xs">
                          <Download className="h-4 w-4" /> Download PDF
                        </a>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={viewUrl}
                      title={note.title}
                      className="h-full w-full border-0"
                      onLoad={() => setIframeLoaded(true)}
                      onError={() => setIframeError(true)}
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Clean Unit Placeholder (No PDF Uploaded Yet) */
            <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 sm:p-10 shadow-sm border border-zinc-200 text-center m-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                <FileText className="h-8 w-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-2">
                <Layers className="h-3.5 w-3.5" /> Unit {note.unit || 1}
              </div>

              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950">
                {note.title}
              </h2>

              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {getSubjectShortform(note.subject || note.subject_id)}
              </p>

              <div className="mt-5 rounded-xl bg-zinc-50 p-4 border border-zinc-100 text-xs text-zinc-600 leading-relaxed">
                <p className="font-semibold text-zinc-800">📄 PDF Notes Pending Upload</p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  The PDF notes for this unit will appear directly in this reader once uploaded.
                </p>
              </div>

              <div className="mt-5 flex items-center justify-center gap-3 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Semester {note.semester}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> ABES Curriculum
                </span>
              </div>
            </div>
          )}
        </main>

        {/* Mobile-optimized bottom toolbar with quick actions */}
        <footer className="flex shrink-0 items-center justify-between border-t border-zinc-100 bg-white px-4 py-2.5 text-xs text-zinc-500 sm:px-6 sm:py-3">
          <span className="truncate text-[11px] sm:text-xs">
            {note.subject?.name || 'ABES Study Material'}
          </span>
          {hasFile && (
            <div className="flex items-center gap-3">
              <a 
                href={viewUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 font-semibold text-[11px] sm:text-xs flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Full Screen
              </a>
            </div>
          )}
        </footer>
      </div>

      <ReportModal
        note={note}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};
