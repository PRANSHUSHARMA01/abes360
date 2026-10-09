'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { Note, Branch, Subject } from '@/lib/types';
import { DataService } from '@/lib/data-service';
import { getNoteDownloadUrl, getNoteViewUrl, uploadFileToR2, deleteFileFromR2 } from '@/lib/r2-client';
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
  Pin,
  HelpCircle,
  Plus,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Trash2,
  Maximize2
} from 'lucide-react';

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
  const [selectedUnit, setSelectedUnit] = useState<number | 'all' | 'practice'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Upload Practice Question Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadUnit, setUploadUnit] = useState<number>(0); // 0 = General / All Units
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Separate Practice Questions vs Standard Unit Notes
  const { practiceNotes, regularUnitNotes } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const validNotes = notes.filter((n) => Boolean(n.file_path && n.file_path.trim().length > 0));

    const practice: Note[] = [];
    const regular: Note[] = [];

    validNotes.forEach((n) => {
      const isPractice = Boolean(
        n.is_practice || 
        n.unit === 0 || 
        (n.description && n.description.includes('[PRACTICE]'))
      );

      const matchesSearch = !q || (
        n.title.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q) ||
        n.subject?.name.toLowerCase().includes(q) ||
        n.subject?.code?.toLowerCase().includes(q)
      );

      if (!matchesSearch) return;

      if (isPractice) {
        practice.push(n);
      } else {
        regular.push(n);
      }
    });

    return { practiceNotes: practice, regularUnitNotes: regular };
  }, [notes, searchQuery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadFile(file);
    setUploadError(null);

    if (file) {
      if (!uploadTitle) {
        // Auto-fill title from clean filename
        const clean = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setUploadTitle(clean);
      }
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        setUploadPreview(objectUrl);
      } else {
        setUploadPreview(null);
      }
    } else {
      setUploadPreview(null);
    }
  };

  const handleUploadPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a PDF document or image file.');
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError('Please provide a title for the practice question.');
      return;
    }
    if (!selectedSubject) {
      setUploadError('Please select a subject first.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Upload to Cloudflare R2 / Supabase Storage
      const key = await uploadFileToR2({
        file: uploadFile,
        branchCode: selectedBranchCode,
        semester: selectedSemester,
        subjectId: selectedSubject,
      });

      // 2. Save note record marked as practice
      await DataService.addNote({
        branch_id: selectedBranch,
        semester: selectedSemester,
        subject_id: selectedSubject,
        unit: uploadUnit,
        title: uploadTitle.trim(),
        file_path: key,
        description: `[PRACTICE] ${uploadUnit > 0 ? `Unit ${uploadUnit}` : 'General'} practice question / paper`,
        is_practice: true,
      });

      setUploadSuccess(true);
      await fetchNotes();

      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess(false);
        setUploadTitle('');
        setUploadUnit(0);
        setUploadFile(null);
        setUploadPreview(null);
      }, 1200);
    } catch (err: any) {
      console.error('Practice upload error:', err);
      setUploadError(err?.message || 'Failed to upload practice question. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteNote = async (note: Note) => {
    if (!confirm(`Are you sure you want to delete "${note.title}"?`)) return;
    try {
      await deleteFileFromR2(note.file_path);
      await DataService.deleteNote(note.id);
      await fetchNotes();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete note.');
    }
  };

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
              Select a subject below to view its pinned practice chapter, PYQs, and structured 5-unit notes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => {
                setUploadError(null);
                setUploadSuccess(false);
                setIsUploadModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Upload Practice Question
            </button>

            {isAdmin && (
              <Link href="/admin/notes" className="apple-secondary-button text-xs">
                <Lock className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </div>
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
                {sub.code ? `[${sub.code}] ` : ''}{sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Unit & Practice Tabs Navigation */}
        <div className="mt-5 flex items-center gap-1.5 overflow-x-auto border-t border-zinc-100 pt-4 scrollbar-none">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mr-2 shrink-0">
            <Layers className="h-3.5 w-3.5" /> View:
          </span>

          <button
            onClick={() => setSelectedUnit('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition shrink-0 ${
              selectedUnit === 'all'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            All Units & Practice
          </button>

          {/* Pinned Practice Filter Tab */}
          <button
            onClick={() => setSelectedUnit('practice')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition shrink-0 ${
              selectedUnit === 'practice'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <Pin className="h-3 w-3 fill-current" />
            <span>Practice Chapter</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${selectedUnit === 'practice' ? 'bg-white/25 text-white' : 'bg-indigo-200/80 text-indigo-900 font-bold'}`}>
              {practiceNotes.length}
            </span>
          </button>

          {UNITS.map((u) => {
            const isSelected = selectedUnit === u;
            const count = regularUnitNotes.filter((n) => (n.unit || 1) === u).length;
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
                  {count}
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
                {currentSubjectObj.code ? `[${currentSubjectObj.code}] ` : ''}{currentSubjectObj.name}
              </h2>
            </div>
            {isAdmin && (
              <Link href="/admin/notes" className="apple-secondary-button text-xs">
                <Lock className="h-3.5 w-3.5" /> Admin Manager
              </Link>
            )}
          </div>

          <div className="space-y-6">
            {/* ========================================================================= */}
            {/* PINNED PRACTICE SECTION (Chapter at the top of every subject)             */}
            {/* ========================================================================= */}
            {(selectedUnit === 'all' || selectedUnit === 'practice' || typeof selectedUnit === 'number') && (
              <div className="rounded-3xl border-2 border-indigo-200/80 bg-gradient-to-b from-indigo-50/40 to-white p-5 shadow-sm sm:p-6 transition hover:border-indigo-300">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                      <Pin className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                          📌 Pinned Chapter
                        </span>
                        <span className="text-xs font-semibold text-indigo-600">
                          {practiceNotes.length} practice item{practiceNotes.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <h3 className="mt-0.5 text-lg font-bold text-zinc-950">
                        Practice Questions, PYQs & Question Bank
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Previous year question papers, assignment sheets, and problem sets (PDFs & Images)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setUploadError(null);
                      setUploadSuccess(false);
                      setIsUploadModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Upload Question / Sheet
                  </button>
                </div>

                {/* Practice Content Grid */}
                {practiceNotes.length === 0 ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-500 mb-2.5">
                      <HelpCircle className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-800">No practice questions uploaded yet</p>
                    <p className="mt-0.5 max-w-md text-xs text-zinc-500">
                      Be the first to share previous year question papers, problem sets, or handwritten solutions in PDF or image format.
                    </p>
                    <button
                      onClick={() => {
                        setUploadError(null);
                        setUploadSuccess(false);
                        setIsUploadModalOpen(true);
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                    >
                      <Plus className="h-3.5 w-3.5" /> Upload Practice Material
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {practiceNotes.map((note) => {
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
                              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                                isImg ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-700'
                              }`}>
                                {isImg ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                {isImg ? 'Image / Scan' : 'PDF Document'}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-zinc-400">
                                  {new Date(note.created_at).toLocaleDateString()}
                                </span>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleDeleteNote(note)}
                                    className="text-zinc-400 hover:text-red-600 transition p-0.5"
                                    title="Delete Practice Item"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Image Thumbnail Preview if image */}
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
                            {note.unit && note.unit > 0 ? (
                              <span className="mt-1 inline-block text-[11px] font-medium text-indigo-600">
                                Unit {note.unit} Practice
                              </span>
                            ) : null}
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
                                title={isImg ? 'Download original image' : 'Download with watermark'}
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
            )}

            {/* ========================================================================= */}
            {/* 5-UNIT SYLLABUS NOTES SECTION                                             */}
            {/* ========================================================================= */}
            {selectedUnit !== 'practice' && (
              <div className="space-y-6">
                {UNITS.filter((u) => selectedUnit === 'all' || selectedUnit === u).map((unitNumber) => {
                  const unitNotes = regularUnitNotes.filter((n) => (n.unit || 1) === unitNumber);
                  const syllabusSub = ABES_SYLLABUS.find((s) => s.code === currentSubjectObj.code || s.name === currentSubjectObj.name);
                  const unitObj = syllabusSub?.units?.find((u) => u.unitNumber === unitNumber);
                  const unitTitle = unitObj?.unitName ? `Unit ${unitNumber} – ${unitObj.unitName}` : `Unit ${unitNumber}`;

                  return (
                    <div 
                      key={unitNumber} 
                      className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-zinc-300 sm:p-6"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold text-sm">
                            U{unitNumber}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-zinc-950">{unitTitle}</h3>
                            <p className="text-xs text-zinc-400">
                              {unitNotes.length === 0 ? 'Pending upload' : `${unitNotes.length} document${unitNotes.length === 1 ? '' : 's'} available`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {unitNotes.length === 0 ? (
                        <div className="py-8 text-center flex flex-col items-center justify-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 mb-2">
                            <FileText className="h-5 w-5" />
                          </div>
                          <p className="text-sm font-semibold text-zinc-700">No notes uploaded for Unit {unitNumber} yet</p>
                          <p className="mt-0.5 text-xs text-zinc-400">Official syllabus notes and PDFs will be uploaded soon.</p>
                        </div>
                      ) : (
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {unitNotes.map((note) => {
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
                                      Unit {note.unit || unitNumber}
                                    </span>
                                    <span className="text-[11px] text-zinc-400">
                                      {new Date(note.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
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
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="apple-card px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900">Select a Subject</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
            Choose a subject from the dropdown above to view its structured practice chapter and 5 units.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UPLOAD PRACTICE QUESTIONS / PYQS MODAL (Open to All Users)               */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">Upload Practice Material</h3>
                  <p className="text-xs text-zinc-500">PDF documents & images (PNG, JPG, WEBP)</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="apple-icon-button -mr-2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="py-10 text-center flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3 animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-bold text-zinc-900">Practice Question Uploaded!</h4>
                <p className="text-xs text-zinc-500 mt-1">Available immediately in the pinned Practice section.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadPractice} className="mt-5 space-y-4">
                {uploadError && (
                  <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
                    {uploadError}
                  </div>
                )}

                {/* Target Subject (read-only display) */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Target Subject</label>
                  <div className="rounded-xl bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold text-zinc-800 border border-zinc-200">
                    {currentSubjectObj ? `${currentSubjectObj.code ? `[${currentSubjectObj.code}] ` : ''}${currentSubjectObj.name}` : 'Select a subject first'}
                  </div>
                </div>

                {/* Document Title */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Question / Material Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. 2024 Mid-Term PYQ with Solutions"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Associated Unit Selection */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Associated Unit (Optional)
                  </label>
                  <select
                    value={uploadUnit}
                    onChange={(e) => setUploadUnit(Number(e.target.value))}
                    className="apple-select text-xs"
                  >
                    <option value={0}>General / All Units / PYQ</option>
                    <option value={1}>Unit 1 Practice</option>
                    <option value={2}>Unit 2 Practice</option>
                    <option value={3}>Unit 3 Practice</option>
                    <option value={4}>Unit 4 Practice</option>
                    <option value={5}>Unit 5 Practice</option>
                  </select>
                </div>

                {/* File Dropzone / Selector */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Select File (PDF or Image) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-6 text-center cursor-pointer transition hover:border-indigo-400 hover:bg-indigo-50/30"
                  >
                    {uploadPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={uploadPreview}
                          alt="Preview"
                          className="h-28 max-w-full rounded-xl object-contain border border-zinc-200 bg-white p-1 shadow-sm"
                        />
                        <span className="text-xs font-semibold text-indigo-600">Click to change image</span>
                      </div>
                    ) : uploadFile ? (
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
                          PDF
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-zinc-900 truncate max-w-[240px]">{uploadFile.name}</p>
                          <p className="text-[11px] text-zinc-400">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-2">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-zinc-800">
                          Click to browse or drag and drop
                        </p>
                        <p className="mt-0.5 text-[11px] text-zinc-400">
                          Supports PDF, PNG, JPG, JPEG, WEBP (Up to 50MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    disabled={isUploading}
                    className="apple-secondary-button text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4" /> Upload Practice Question
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
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
                <ImageIcon className="h-4 w-4 text-indigo-400 shrink-0" />
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
    </div>
  );
};

