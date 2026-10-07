'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Note, Branch, Subject } from '@/lib/types';
import { DataService } from '@/lib/data-service';
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
  BookOpen
} from 'lucide-react';

interface NotesCatalogProps {
  initialBranchId?: string;
  initialSemester?: number;
}

const UNITS = [1, 2, 3, 4, 5];

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

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesSearch = !q || (
        note.title.toLowerCase().includes(q) ||
        note.description?.toLowerCase().includes(q) ||
        note.subject?.name.toLowerCase().includes(q) ||
        note.subject?.code?.toLowerCase().includes(q)
      );
      const matchesUnit = selectedUnit === 'all' || (note.unit || 1) === selectedUnit;
      return matchesSearch && matchesUnit;
    });
  }, [notes, searchQuery, selectedUnit]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <section className="apple-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="apple-eyebrow">Study library</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                <Sparkles className="h-3 w-3" /> Direct PDF Access
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">Notes</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Select a subject below to view its structured 5-unit notes and study materials.
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
                {sub.code ? `[${sub.code}] ` : ''}{sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* 5-Unit Tabs Navigation */}
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
            const count = filteredNotes.filter((n) => (n.unit || 1) === u && Boolean(n.file_path && n.file_path.trim().length > 0)).length;
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

      {/* Structured 5 Units for Selected Subject */}
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
            {UNITS.filter((u) => selectedUnit === 'all' || selectedUnit === u).map((unitNumber) => {
              const unitNotes = filteredNotes.filter((n) => (n.unit || 1) === unitNumber && Boolean(n.file_path && n.file_path.trim().length > 0));
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
                      <p className="mt-0.5 text-xs text-zinc-400">Study materials and official PDFs will be uploaded soon.</p>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {unitNotes.map((note) => {
                        const fileName = note.file_path ? (note.file_path.split('/').pop() || `${note.title}.pdf`) : `${note.title}.pdf`;
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
                              <a
                                href={getNoteViewUrl(note.file_path, fileName)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                <ExternalLink className="h-3.5 w-3.5" /> Open PDF
                              </a>

                              {note.file_path && (
                                <a
                                  href={getNoteDownloadUrl(note.file_path, fileName)}
                                  download={fileName}
                                  className="apple-icon-button h-8 w-8 text-zinc-500 hover:text-zinc-900"
                                  title="Download a copy with Clasy watermark"
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
    </div>
  );
};
