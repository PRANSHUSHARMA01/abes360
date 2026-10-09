'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Note, Branch, Subject } from '@/lib/types';
import { DataService, getSubjectShortform } from '@/lib/data-service';
import { getNoteDownloadUrl, getNoteViewUrl } from '@/lib/r2-client';
import { ABES_SYLLABUS } from '@/lib/syllabus-data';
import { 
  Download, 
  FileText, 
  Search, 
  X, 
  Layers, 
  Sparkles, 
  ExternalLink, 
  Lock,
  BookOpen, 
  Image as ImageIcon,
  HelpCircle,
  Maximize2,
  GraduationCap
} from 'lucide-react';
import { SyllabusModal } from './SyllabusModal';

interface NotesCatalogProps {
  initialBranchId?: string;
  initialSemester?: number;
}

const UNITS = [1, 2, 3, 4, 5];

function isImageFile(filePath: string, fileName?: string): boolean {
  const target = (fileName || filePath || '').toLowerCase();
  const ext = target.split('.').pop() || '';
  return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
}

export const NotesCatalog: React.FC<NotesCatalogProps> = ({ initialBranchId = 'b-cse', initialSemester = 3 }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedBranch, setSelectedBranch] = useState(initialBranchId);
  const [selectedSemester, setSelectedSemester] = useState(initialSemester);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);

  // Lightbox State for Image Viewing
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; downloadUrl: string } | null>(null);

  useEffect(() => {
    DataService.getBranches().then(setBranches);
    if (typeof window !== 'undefined') {
      setIsAdmin(sessionStorage.getItem('clasy_admin_session') === 'true');
    }
  }, []);

  const fetchNotes = React.useCallback(async () => {
    const data = await DataService.getNotes(selectedBranch, selectedSemester, selectedSubject || undefined);
    setNotes(data);
  }, [selectedBranch, selectedSemester, selectedSubject]);

  useEffect(() => {
    DataService.getSubjects(selectedBranch, selectedSemester).then((list) => {
      setSubjects(list);
      setSelectedSubject((current) => {
        if (list.some((s) => s.id === current)) return current;
        return list[0]?.id || '';
      });
    });
    fetchNotes();
  }, [selectedBranch, selectedSemester, selectedSubject, fetchNotes]);

  const selectedBranchObj = branches.find((b) => b.id === selectedBranch);
  const selectedBranchCode = selectedBranchObj?.code || 'CSE';
  const currentSubjectObj = subjects.find((s) => s.id === selectedSubject) || subjects[0];

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const validNotes = notes.filter((n) => Boolean(n.file_path && n.file_path.trim().length > 0));

    return validNotes.filter((n) => {
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q) ||
        n.subject?.name.toLowerCase().includes(q) ||
        n.subject?.code?.toLowerCase().includes(q)
      );
    });
  }, [notes, searchQuery]);

  // General / Subject-wide practice notes (Unit 0)
  const generalPracticeNotes = useMemo(() => {
    return filteredNotes.filter((n) => n.is_practice && (n.unit === 0 || !n.unit));
  }, [filteredNotes]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <section className="apple-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="apple-eyebrow">Study library</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                <Sparkles className="h-3 w-3" /> Direct PDF & Image Access
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">Notes & Practice</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Select a subject below to view its 5 units with dedicated theory notes and practice questions.
            </p>
          </div>

          {isAdmin && (
            <Link href="/admin/notes" className="apple-primary-button self-start lg:self-auto">
              <Lock className="h-4 w-4" />
              Manage Notes (Admin)
            </Link>
          )}
        </div>

        {/* Primary Filter Bar */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="apple-input-wrap sm:col-span-2 lg:col-span-1">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in this subject..."
              className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="apple-select"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} — {b.name.replace('Computer Science & Engineering — ', '')}
              </option>
            ))}
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="apple-select"
          >
            <option value={3}>Semester 3</option>
            <option value={4}>Semester 4</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="apple-select font-medium text-zinc-900"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {getSubjectShortform(sub)}
              </option>
            ))}
          </select>
        </div>

        {/* Small 2nd Year Syllabus Card */}
        <div className="mt-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 via-teal-50/30 to-white p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/90 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <GraduationCap className="h-3 w-3" /> 2nd Year Syllabus
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">
                  {selectedBranchCode} · Semester {selectedSemester}
                </span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm font-bold text-zinc-900 truncate">
                {getSubjectShortform(currentSubjectObj)} — Official 5-Unit Detailed Syllabus & Scheme
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setIsSyllabusModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <BookOpen className="h-3.5 w-3.5" /> View Syllabus
            </button>
            <Link
              href="/planner"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Study Planner
            </Link>
          </div>
        </div>

        {/* Unit Tabs Navigation */}
        <div className="mt-5 flex items-center gap-1.5 overflow-x-auto border-t border-zinc-100 pt-4 scrollbar-none">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mr-2 shrink-0">
            <Layers className="h-3.5 w-3.5" /> Unit Filter:
          </span>

          <button
            onClick={() => setSelectedUnit('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition shrink-0 ${
              selectedUnit === 'all'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            All Units
          </button>

          {UNITS.map((u) => {
            const isSelected = selectedUnit === u;
            const unitTotal = filteredNotes.filter((n) => (n.unit || 1) === u).length;
            return (
              <button
                key={u}
                onClick={() => setSelectedUnit(u)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <span>Unit {u}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${isSelected ? 'bg-white/25 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                  {unitTotal}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Subject Section */}
      {currentSubjectObj ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="apple-eyebrow">{selectedBranchCode} · Sem {selectedSemester}</span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950">
                {getSubjectShortform(currentSubjectObj)}
              </h2>
            </div>
            {isAdmin && (
              <Link href="/admin/notes" className="apple-secondary-button text-xs">
                <Lock className="h-3.5 w-3.5" /> Admin Manager
              </Link>
            )}
          </div>

          {/* General Subject-Wide Practice Questions (if any exist) */}
          {generalPracticeNotes.length > 0 && selectedUnit === 'all' && (
            <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/40 to-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm">
                    PYQ
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-950">General Question Bank & Subject PYQs</h3>
                    <p className="text-xs text-zinc-500">Comprehensive previous year question papers and full-syllabus problem sets</p>
                  </div>
                </div>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
                  {generalPracticeNotes.length} document{generalPracticeNotes.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {generalPracticeNotes.map((note) => {
                  const fileName = note.file_path ? (note.file_path.split('/').pop() || `${note.title}.pdf`) : `${note.title}.pdf`;
                  const isImg = isImageFile(note.file_path, fileName);
                  const viewUrl = getNoteViewUrl(note.file_path, fileName);
                  const downloadUrl = getNoteDownloadUrl(note.file_path, fileName);

                  return (
                    <div 
                      key={note.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                            {isImg ? <ImageIcon className="h-3 w-3" /> : <HelpCircle className="h-3 w-3" />}
                            General PYQ
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {isImg && (
                          <div 
                            onClick={() => setLightboxImage({ url: viewUrl, title: note.title, downloadUrl })}
                            className="mt-2.5 relative h-28 w-full overflow-hidden rounded-xl bg-zinc-100 cursor-pointer border border-zinc-200 group/img"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={viewUrl}
                              alt={note.title}
                              className="h-full w-full object-cover transition group-hover/img:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1 backdrop-blur-[2px]">
                              <Maximize2 className="h-4 w-4" /> View Fullscreen
                            </div>
                          </div>
                        )}

                        <h4 className="mt-2 text-sm font-semibold text-zinc-900 line-clamp-2">
                          {note.title}
                        </h4>
                      </div>

                      <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-3">
                        {isImg ? (
                          <button
                            onClick={() => setLightboxImage({ url: viewUrl, title: note.title, downloadUrl })}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                          >
                            <ImageIcon className="h-3.5 w-3.5" /> View Image
                          </button>
                        ) : (
                          <a
                            href={viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Open PDF
                          </a>
                        )}

                        {note.file_path && (
                          <a
                            href={downloadUrl}
                            download={fileName}
                            className="apple-icon-button h-8 w-8 text-zinc-500 hover:text-zinc-900"
                            title={isImg ? 'Download image' : 'Download with watermark'}
                            aria-label="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5 Units Breakdown with Embedded Practice Sub-cards */}
          <div className="space-y-6">
            {UNITS.filter((u) => selectedUnit === 'all' || selectedUnit === u).map((unitNumber) => {
              // Separate Unit Theory Notes vs Unit Practice Notes
              const unitTheoryNotes = filteredNotes.filter((n) => !n.is_practice && (n.unit || 1) === unitNumber);
              const unitPracticeNotes = filteredNotes.filter((n) => n.is_practice && (n.unit || 1) === unitNumber);

              const syllabusSub = ABES_SYLLABUS.find(
                (s) =>
                  s.code === currentSubjectObj.code ||
                  s.name === currentSubjectObj.name ||
                  getSubjectShortform(s) === getSubjectShortform(currentSubjectObj)
              );
              const unitObj = syllabusSub?.units?.find((u) => u.unitNumber === unitNumber);
              const unitTitle = unitObj?.unitName ? `Unit ${unitNumber} – ${unitObj.unitName}` : `Unit ${unitNumber}`;

              return (
                <div 
                  key={unitNumber} 
                  className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-zinc-300 sm:p-6 space-y-5"
                >
                  {/* Unit Main Header */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 font-bold text-sm">
                        U{unitNumber}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-zinc-950">{unitTitle}</h3>
                        <p className="text-xs text-zinc-400">
                          {unitTheoryNotes.length} theory note{unitTheoryNotes.length === 1 ? '' : 's'} · {unitPracticeNotes.length} practice doc{unitPracticeNotes.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <Link href="/admin/notes" className="apple-secondary-button text-xs self-start sm:self-auto">
                        <Lock className="h-3.5 w-3.5" /> Manage Unit {unitNumber}
                      </Link>
                    )}
                  </div>

                  {/* Section 1: Theory & Chapter Notes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                          <FileText className="h-3 w-3" />
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Theory & Chapter Notes</h4>
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-400">
                        {unitTheoryNotes.length === 0 ? 'Pending' : `${unitTheoryNotes.length} available`}
                      </span>
                    </div>

                    {unitTheoryNotes.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 py-6 text-center flex flex-col items-center justify-center">
                        <FileText className="h-5 w-5 text-zinc-400 mb-1.5" />
                        <p className="text-xs font-semibold text-zinc-700">No theory notes uploaded for Unit {unitNumber} yet</p>
                        <p className="mt-0.5 text-[11px] text-zinc-400">Official syllabus notes and PDFs will be uploaded soon.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {unitTheoryNotes.map((note) => {
                          const fileName = note.file_path ? (note.file_path.split('/').pop() || `${note.title}.pdf`) : `${note.title}.pdf`;
                          const isImg = isImageFile(note.file_path, fileName);
                          const viewUrl = getNoteViewUrl(note.file_path, fileName);
                          const downloadUrl = getNoteDownloadUrl(note.file_path, fileName);

                          return (
                            <div 
                              key={note.id}
                              className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                    {isImg ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                    Unit {note.unit || unitNumber} Note
                                  </span>
                                  <span className="text-[11px] text-zinc-400">
                                    {new Date(note.created_at).toLocaleDateString()}
                                  </span>
                                </div>

                                {isImg && (
                                  <div 
                                    onClick={() => setLightboxImage({ url: viewUrl, title: note.title, downloadUrl })}
                                    className="mt-2.5 relative h-28 w-full overflow-hidden rounded-xl bg-zinc-100 cursor-pointer border border-zinc-200 group/img"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={viewUrl}
                                      alt={note.title}
                                      className="h-full w-full object-cover transition group-hover/img:scale-105"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1 backdrop-blur-[2px]">
                                      <Maximize2 className="h-4 w-4" /> View Fullscreen
                                    </div>
                                  </div>
                                )}

                                <h4 className="mt-2 text-sm font-semibold text-zinc-900 line-clamp-2">
                                  {note.title}
                                </h4>
                              </div>

                              <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-3">
                                {isImg ? (
                                  <button
                                    onClick={() => setLightboxImage({ url: viewUrl, title: note.title, downloadUrl })}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                  >
                                    <ImageIcon className="h-3.5 w-3.5" /> View Image
                                  </button>
                                ) : (
                                  <a
                                    href={viewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" /> Open PDF
                                  </a>
                                )}

                                {note.file_path && (
                                  <a
                                    href={downloadUrl}
                                    download={fileName}
                                    className="apple-icon-button h-8 w-8 text-zinc-500 hover:text-zinc-900"
                                    title={isImg ? 'Download image' : 'Download a copy with watermark'}
                                    aria-label="Download"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Section 2: Unit Practice Sub-card */}
                  <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                          <HelpCircle className="h-3 w-3" />
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                          Unit {unitNumber} Practice & PYQs
                        </h4>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100/80 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                        {unitPracticeNotes.length} practice item{unitPracticeNotes.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {unitPracticeNotes.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-indigo-200/80 bg-white/70 py-5 text-center flex flex-col items-center justify-center">
                        <HelpCircle className="h-4 w-4 text-indigo-400 mb-1" />
                        <p className="text-xs font-semibold text-indigo-950">No practice questions uploaded for Unit {unitNumber} yet</p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">Assignment sheets, previous year problems, and question sets will be uploaded soon.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {unitPracticeNotes.map((note) => {
                          const fileName = note.file_path ? (note.file_path.split('/').pop() || `${note.title}.pdf`) : `${note.title}.pdf`;
                          const isImg = isImageFile(note.file_path, fileName);
                          const viewUrl = getNoteViewUrl(note.file_path, fileName);
                          const downloadUrl = getNoteDownloadUrl(note.file_path, fileName);

                          return (
                            <div 
                              key={note.id}
                              className="group relative flex flex-col justify-between rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                                    {isImg ? <ImageIcon className="h-3 w-3" /> : <HelpCircle className="h-3 w-3" />}
                                    Unit {unitNumber} Practice
                                  </span>
                                  <span className="text-[11px] text-zinc-400">
                                    {new Date(note.created_at).toLocaleDateString()}
                                  </span>
                                </div>

                                {isImg && (
                                  <div 
                                    onClick={() => setLightboxImage({ url: viewUrl, title: note.title, downloadUrl })}
                                    className="mt-2.5 relative h-28 w-full overflow-hidden rounded-xl bg-zinc-100 cursor-pointer border border-zinc-200 group/img"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={viewUrl}
                                      alt={note.title}
                                      className="h-full w-full object-cover transition group-hover/img:scale-105"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1 backdrop-blur-[2px]">
                                      <Maximize2 className="h-4 w-4" /> View Fullscreen
                                    </div>
                                  </div>
                                )}

                                <h4 className="mt-2 text-sm font-semibold text-zinc-900 line-clamp-2">
                                  {note.title}
                                </h4>
                              </div>

                              <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-3">
                                {isImg ? (
                                  <button
                                    onClick={() => setLightboxImage({ url: viewUrl, title: note.title, downloadUrl })}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                  >
                                    <ImageIcon className="h-3.5 w-3.5" /> View Image
                                  </button>
                                ) : (
                                  <a
                                    href={viewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" /> Open PDF
                                  </a>
                                )}

                                {note.file_path && (
                                  <a
                                    href={downloadUrl}
                                    download={fileName}
                                    className="apple-icon-button h-8 w-8 text-zinc-500 hover:text-zinc-900"
                                    title={isImg ? 'Download image' : 'Download with watermark'}
                                    aria-label="Download"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="apple-card px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900">Select a Subject</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
            Choose a subject from the dropdown above to view its structured 5 units.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMAGE FULLSCREEN LIGHTBOX                                                 */}
      {/* ========================================================================= */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-4 backdrop-blur-md transition-all"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col max-h-[95vh] max-w-5xl w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl"
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 text-white">
              <div className="flex items-center gap-2 truncate pr-2">
                <ImageIcon className="h-4 w-4 text-blue-400 shrink-0" />
                <h3 className="text-sm font-semibold text-zinc-100 truncate">{lightboxImage.title}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={lightboxImage.downloadUrl}
                  download
                  className="apple-icon-button h-8 w-8 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  title="Download image"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="apple-icon-button h-8 w-8 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  title="Close viewer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Body */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-auto bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2nd Year Official Syllabus Modal */}
      <SyllabusModal
        isOpen={isSyllabusModalOpen}
        onClose={() => setIsSyllabusModalOpen(false)}
        initialSemester={selectedSemester}
        initialSubjectId={selectedSubject}
        branchCode={selectedBranchCode}
      />
    </div>
  );
};
