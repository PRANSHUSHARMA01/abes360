'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Note, Branch, Subject, AuthUser } from '@/lib/types';
import { DataService } from '@/lib/data-service';
import { deleteFileFromR2, getNoteDownloadUrl, getNoteViewUrl, uploadFileToR2 } from '@/lib/r2-client';
import { NoteViewerModal } from '@/components/NoteViewerModal';
import { MandatoryAuthModal } from '@/components/MandatoryAuthModal';
import { ABES_SYLLABUS } from '@/lib/syllabus-data';
import { 
  BookOpen, 
  Download, 
  FileText, 
  Plus, 
  Search, 
  Upload, 
  X, 
  Loader2, 
  Eye, 
  Layers, 
  Filter, 
  Sparkles,
  CheckCircle2,
  Calendar,
  Lock,
  ExternalLink
} from 'lucide-react';

interface NotesCatalogProps {
  initialBranchId?: string;
  initialSemester?: number;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const UNITS = [1, 2, 3, 4, 5];

export const NotesCatalog: React.FC<NotesCatalogProps> = ({ initialBranchId = 'b-cse', initialSemester = 3 }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedBranch, setSelectedBranch] = useState(initialBranchId);
  const [selectedSemester, setSelectedSemester] = useState(initialSemester);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth state
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingNote, setPendingNote] = useState<Note | null>(null);

  // In-app viewer modal state
  const [viewingNote, setViewingNote] = useState<Note | null>(null);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubjectId, setUploadSubjectId] = useState('');
  const [uploadUnit, setUploadUnit] = useState<number>(1);
  const [uploadDesc, setUploadDesc] = useState('');
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    DataService.getBranches().then(setBranches);
    DataService.getCurrentUser().then(setAuthUser);
    const unsub = DataService.onAuthStateChange(setAuthUser);
    return () => unsub();
  }, []);

  const fetchNotes = React.useCallback(async () => {
    const data = await DataService.getNotes(selectedBranch, selectedSemester, selectedSubject === 'all' ? undefined : selectedSubject);
    setNotes(data);
  }, [selectedBranch, selectedSemester, selectedSubject]);

  useEffect(() => {
    DataService.getSubjects(selectedBranch, selectedSemester).then((list) => {
      setSubjects(list);
      if (selectedSubject !== 'all' && !list.some((s) => s.id === selectedSubject)) {
        setSelectedSubject('all');
      }
      setUploadSubjectId((current) => (list.some((s) => s.id === current) ? current : list[0]?.id || ''));
    });
    fetchNotes();
  }, [selectedBranch, selectedSemester, selectedSubject, fetchNotes]);

  const selectedBranchObj = branches.find((b) => b.id === selectedBranch);
  const selectedBranchCode = selectedBranchObj?.code || 'CSE';
  const currentSubjectObj = subjects.find((s) => s.id === selectedSubject);

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

  const resetUpload = (defaultUnit = 1, defaultSubjectId?: string) => {
    setUploadTitle('');
    setUploadDesc('');
    setFileObject(null);
    setUploadUnit(defaultUnit);
    setUploadSubjectId(defaultSubjectId || (selectedSubject !== 'all' ? selectedSubject : subjects[0]?.id || ''));
  };

  const handleOpenUpload = (unit = 1, subjectId?: string) => {
    if (!authUser) {
      setAuthModalOpen(true);
      return;
    }
    resetUpload(unit, subjectId);
    setUploadModalOpen(true);
  };

  const handleReadNote = (note: Note) => {
    if (!authUser) {
      setPendingNote(note);
      setAuthModalOpen(true);
      return;
    }
    setViewingNote(note);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadSubjectId) {
      alert('Please select a subject and enter a note title.');
      return;
    }
    if (fileObject && fileObject.size > MAX_FILE_SIZE) {
      alert('Maximum file size is 50 MB.');
      return;
    }

    setUploading(true);
    try {
      let key = '';
      if (fileObject) {
        try {
          key = await uploadFileToR2({
            file: fileObject,
            branchCode: selectedBranchCode,
            semester: selectedSemester,
            subjectId: uploadSubjectId,
          });
        } catch (r2Err) {
          console.warn('R2 upload fallback:', r2Err);
          key = URL.createObjectURL(fileObject);
        }
      }

      await DataService.addNote({
        branch_id: selectedBranch,
        semester: selectedSemester,
        subject_id: uploadSubjectId,
        unit: uploadUnit,
        title: uploadTitle.trim(),
        file_path: key,
        description: uploadDesc.trim(),
      });

      setUploadModalOpen(false);
      resetUpload();
      fetchNotes();
    } catch (err: any) {
      alert(err?.message || 'Could not save the note.');
    } finally {
      setUploading(false);
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
                <Sparkles className="h-3 w-3" /> In-App Reader Enabled
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">Notes</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Read subject study materials directly inside the app without downloading. Categorized by unit.
            </p>
          </div>
          <button onClick={() => handleOpenUpload(selectedUnit === 'all' ? 1 : selectedUnit, selectedSubject !== 'all' ? selectedSubject : undefined)} className="apple-primary-button">
            <Upload className="h-4 w-4" />
            Upload Notes
          </button>
        </div>

        {/* Primary Filter Bar */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="apple-input-wrap sm:col-span-2 lg:col-span-1">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, subjects..."
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
            className="apple-select"
          >
            <option value="all">All Subjects ({subjects.length})</option>
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
            const count = notes.filter((n) => (n.unit || 1) === u).length;
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

      {/* When a specific subject is selected, render its 5 Units */}
      {selectedSubject !== 'all' && currentSubjectObj && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="apple-eyebrow">{selectedBranchCode} · Sem {selectedSemester}</span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950">
                {currentSubjectObj.code ? `[${currentSubjectObj.code}] ` : ''}{currentSubjectObj.name}
              </h2>
            </div>
            <button
              onClick={() => handleOpenUpload(selectedUnit === 'all' ? 1 : selectedUnit, currentSubjectObj.id)}
              className="apple-secondary-button text-xs"
            >
              <Plus className="h-4 w-4" /> Add Note to Subject
            </button>
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
                    <button
                      onClick={() => handleOpenUpload(unitNumber, currentSubjectObj.id)}
                      className="inline-flex items-center gap-1.5 self-start rounded-xl bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 sm:self-auto transition"
                    >
                      <Plus className="h-3.5 w-3.5" /> Upload to Unit {unitNumber}
                    </button>
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
                                  className="apple-icon-button h-8 w-8 text-zinc-500 hover:text-zinc-900"
                                  title="Download a copy"
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
      )}

      {/* All Subjects Notes Grid */}
      {selectedSubject === 'all' && (
        <>
          {filteredNotes.length === 0 ? (
            <div className="apple-card px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-zinc-900">No notes uploaded yet</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
                Study materials and unit PDFs will be uploaded soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => {
                const fileName = note.file_path ? (note.file_path.split('/').pop() || `${note.title}.pdf`) : `${note.title}.pdf`;
                return (
                  <article key={note.id} className="apple-card flex flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-blue-100/70 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                                Unit {note.unit || 1}
                              </span>
                              <p className="truncate text-xs font-semibold text-zinc-500">
                                {note.subject?.code || 'CSE'}
                              </p>
                            </div>
                            <h2 className="mt-0.5 truncate text-sm font-semibold text-zinc-900 sm:text-base">
                              {note.title}
                            </h2>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                          Sem {note.semester}
                        </span>
                      </div>

                      <p className="mt-3 text-xs font-medium text-zinc-500 truncate">
                        {note.subject?.name}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-2 border-t border-zinc-100 pt-4">
                      <span className="truncate text-[11px] text-zinc-400">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <a
                          href={getNoteViewUrl(note.file_path, fileName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="apple-primary-button py-2 px-3 text-xs"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Open PDF
                        </a>

                        {note.file_path && (
                          <a 
                            href={getNoteDownloadUrl(note.file_path, fileName)} 
                            className="apple-icon-button h-8 w-8" 
                            title="Download file"
                            aria-label={`Download ${note.title}`}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* In-App Note Viewer Modal */}
      <NoteViewerModal
        note={viewingNote}
        isOpen={Boolean(viewingNote)}
        onClose={() => setViewingNote(null)}
      />

      {/* Mandatory Auth Modal */}
      <MandatoryAuthModal
        isOpen={authModalOpen}
        onSuccess={(loggedUser) => {
          setAuthUser(loggedUser);
          setAuthModalOpen(false);
          if (pendingNote) {
            setViewingNote(pendingNote);
            setPendingNote(null);
          }
        }}
        title="Sign in with Google to Read &amp; Upload Notes"
        subtitle="Access to ABES notes and study materials requires signing in with your Google account."
      />

      {/* Upload Note Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px] sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="apple-eyebrow">Clasy library</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">Upload Note</h2>
              </div>
              <button 
                onClick={() => { setUploadModalOpen(false); resetUpload(); }} 
                className="apple-icon-button" 
                aria-label="Close upload modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-6 space-y-4">
              <div>
                <label className="apple-label">Select subject</label>
                <select 
                  required 
                  value={uploadSubjectId} 
                  onChange={(e) => setUploadSubjectId(e.target.value)} 
                  className="apple-select w-full"
                >
                  <option value="">Select a subject...</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code ? `[${subject.code}] ` : ''}{subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="apple-label">Unit</label>
                <select
                  value={uploadUnit}
                  onChange={(e) => {
                    const u = Number(e.target.value);
                    setUploadUnit(u);
                    const selSub = subjects.find((s) => s.id === uploadSubjectId);
                    const syllabusSub = ABES_SYLLABUS.find((s) => s.code === selSub?.code || s.name === selSub?.name);
                    const unitObj = syllabusSub?.units?.find((un) => un.unitNumber === u);
                    if (unitObj?.unitName) {
                      setUploadTitle(`Unit ${u}: ${unitObj.unitName}`);
                    } else {
                      setUploadTitle(`Unit ${u} Notes`);
                    }
                  }}
                  className="apple-select w-full"
                >
                  {UNITS.map((u) => {
                    const selSub = subjects.find((s) => s.id === uploadSubjectId);
                    const syllabusSub = ABES_SYLLABUS.find((s) => s.code === selSub?.code || s.name === selSub?.name);
                    const unitObj = syllabusSub?.units?.find((un) => un.unitNumber === u);
                    const unitLabel = unitObj?.unitName ? `Unit ${u} – ${unitObj.unitName}` : `Unit ${u}`;

                    return (
                      <option key={u} value={u}>
                        {unitLabel}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="apple-label">Unit / Note title</label>
                <input 
                  required 
                  value={uploadTitle} 
                  onChange={(e) => setUploadTitle(e.target.value)} 
                  placeholder="e.g. Unit 1: Programming Paradigms & C++ Basics" 
                  className="apple-text-input" 
                />
              </div>

              <div>
                <label className="apple-label">Attach PDF File <span className="font-normal text-zinc-400">(.pdf)</span></label>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-4 transition hover:border-blue-400 hover:bg-blue-50/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800">
                      {fileObject?.name || 'Choose PDF file from device'}
                    </p>
                    <p className="text-xs text-zinc-400">PDF will be displayed directly in the in-app viewer</p>
                  </div>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg" 
                    className="sr-only" 
                    onChange={(e) => setFileObject(e.target.files?.[0] || null)} 
                  />
                </label>
              </div>

              <button 
                type="submit" 
                disabled={uploading} 
                className="apple-primary-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading PDF...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Save & Upload PDF
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
