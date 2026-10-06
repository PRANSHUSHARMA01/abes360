'use client';

import React, { useEffect, useState } from 'react';
import { Note } from '@/lib/types';
import { getNoteDownloadUrl, getNoteViewUrl } from '@/lib/r2-client';
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
  ZoomIn, 
  ZoomOut,
  AlertCircle,
  Clock,
  Calendar,
  Flag
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
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal');
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
  const isPdf = fileExt === 'pdf';
  const hasFile = Boolean(note.file_path && note.file_path.trim().length > 0);
  const viewUrl = hasFile ? getNoteViewUrl(note.file_path, fileName) : '';
  const downloadUrl = hasFile ? getNoteDownloadUrl(note.file_path, fileName) : '';

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 md:p-6 backdrop-blur-md transition-all">
      <div 
        className={`relative flex flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 ${
          isFullscreen 
            ? 'h-full w-full rounded-none sm:rounded-2xl' 
            : 'h-[92vh] w-full max-w-5xl rounded-3xl sm:rounded-[28px]'
        }`}
      >
        {/* Top Header Bar */}
        <header className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  <Layers className="h-3 w-3" />
                  Unit {note.unit || 1}
                </span>
                <span className="truncate rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                  {note.subject?.code || 'CSE'} · {note.subject?.name || 'Subject Notes'}
                </span>
              </div>
              <h2 className="mt-0.5 truncate text-base font-semibold text-zinc-950 sm:text-lg">
                {note.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {hasFile && (
              <a 
                href={viewUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="apple-icon-button hidden sm:flex" 
                title="Open in new window"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {hasFile && (
              <a 
                href={downloadUrl} 
                className="apple-icon-button" 
                title="Save a copy"
                aria-label="Download note"
              >
                <Download className="h-4 w-4" />
              </a>
            )}

            <button 
              onClick={handleShare} 
              className="apple-icon-button hidden sm:flex" 
              title="Copy link"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            </button>

            <button 
              onClick={() => setIsReportOpen(true)} 
              className="apple-icon-button hover:text-amber-600" 
              title="Report note issue or copyright"
              aria-label="Report note"
            >
              <Flag className="h-4 w-4" />
            </button>

            <button 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              className="apple-icon-button hidden sm:flex" 
              title={isFullscreen ? 'Exit full screen' : 'Full screen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button 
              onClick={onClose} 
              className="apple-icon-button hover:bg-zinc-100" 
              title="Close viewer (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Viewer Content Canvas */}
        <main className="relative flex-1 overflow-y-auto bg-zinc-50 p-3 sm:p-6 flex flex-col justify-center">
          {hasFile ? (
            <div className="h-full w-full rounded-2xl bg-white shadow-inner flex flex-col overflow-hidden">
              {isImage ? (
                <div className="flex h-full w-full items-center justify-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={viewUrl} 
                    alt={note.title} 
                    className="max-h-full max-w-full rounded-xl object-contain shadow-sm" 
                  />
                </div>
              ) : (
                <div className="relative h-full w-full">
                  {!iframeLoaded && !iframeError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-50/80 backdrop-blur-sm z-10">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <p className="text-sm font-medium text-zinc-600">Opening PDF in viewer...</p>
                    </div>
                  )}

                  {iframeError ? (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                      <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
                      <h3 className="text-lg font-semibold text-zinc-900">Direct preview unavailable</h3>
                      <p className="mt-1 max-w-md text-sm text-zinc-500">
                        This file format or browser setting prevents inline iframe embedding. You can open it in a clean tab or download it.
                      </p>
                      <div className="mt-5 flex gap-3">
                        <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="apple-primary-button">
                          <ExternalLink className="h-4 w-4" /> Open In New Tab
                        </a>
                        <a href={downloadUrl} className="apple-secondary-button">
                          <Download className="h-4 w-4" /> Download File
                        </a>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={viewUrl}
                      title={note.title}
                      className="h-full w-full border-0 rounded-2xl"
                      onLoad={() => setIframeLoaded(true)}
                      onError={() => setIframeError(true)}
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Clean Unit Placeholder (No PDF Uploaded Yet) */
            <div className="mx-auto w-full max-w-xl rounded-3xl bg-white p-8 sm:p-12 shadow-sm border border-zinc-200/80 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-inner mb-6">
                <FileText className="h-10 w-10" />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-3">
                <Layers className="h-3.5 w-3.5" /> Unit {note.unit || 1}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
                {note.title}
              </h2>

              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {note.subject?.code || 'CSE'} · {note.subject?.name || 'Subject'}
              </p>

              <div className="mt-6 rounded-2xl bg-zinc-50 p-5 border border-zinc-100 text-sm text-zinc-600 leading-relaxed">
                <p className="font-semibold text-zinc-800">📄 PDF Notes Pending Upload</p>
                <p className="mt-1 text-xs text-zinc-500">
                  The admin will upload the official PDF notes for this unit. Once uploaded, only the complete PDF will be displayed directly in this viewer.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Semester {note.semester}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> ABES Curriculum
                </span>
              </div>
            </div>
          )}
        </main>

        {/* Footer info bar */}
        <footer className="flex shrink-0 items-center justify-between border-t border-zinc-100 bg-white px-5 py-3 text-xs text-zinc-400 sm:px-6">
          <span>Clasy In-App Reader · ABES Academic Curriculum</span>
          <span>{note.subject?.name || 'Study Material'}</span>
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
