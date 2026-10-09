'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Loader2, 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  BookOpen, 
  Eye, 
  Layers,
  ExternalLink
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { DataService } from '@/lib/data-service';
import { Branch, Note, Subject } from '@/lib/types';
import { deleteFileFromR2, getNoteDownloadUrl, getNoteViewUrl, uploadFileToR2 } from '@/lib/r2-client';
import { NoteViewerModal } from '@/components/NoteViewerModal';

const UNITS = [1, 2, 3, 4, 5];

export default function AdminNotesPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('b-cse');
  const [selectedSem, setSelectedSem] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [unit, setUnit] = useState<number>(1);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // In-app note viewer state
  const [viewingNote, setViewingNote] = useState<Note | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem('clasy_admin_session');
    if (!session) {
      router.push('/admin/login');
      return;
    }
    setAuthenticated(true);
    DataService.getBranches().then(setBranches);
  }, [router]);

  const loadData = React.useCallback(async () => {
    const [subjectList, noteList] = await Promise.all([
      DataService.getSubjects(selectedBranch, selectedSem),
      DataService.getNotes(selectedBranch, selectedSem),
    ]);
    setSubjects(subjectList);
    setNotes(noteList);
    setSubjectId((current) => current || subjectList[0]?.id || '');
  }, [selectedBranch, selectedSem]);

  useEffect(() => {
    if (!authenticated) return;
    loadData();
  }, [authenticated, loadData]);

  const branchCode = branches.find((branch) => branch.id === selectedBranch)?.code || 'CSE';

  const resetForm = () => {
    setTitle('');
    setUnit(1);
    setFileObject(null);
    setSubjectId(subjects[0]?.id || '');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) {
      alert('Please select a subject and enter a note title.');
      return;
    }

    setUploading(true);
    try {
      let key = '';
      if (fileObject) {
        try {
          key = await uploadFileToR2({
            file: fileObject,
            branchCode,
            semester: selectedSem,
            subjectId,
          });
        } catch (r2Err) {
          console.warn('R2 upload skipped or failed, storing note locally with in-app reader fallback:', r2Err);
          key = URL.createObjectURL(fileObject);
        }
      }

      await DataService.addNote({
        branch_id: selectedBranch,
        semester: selectedSem,
        subject_id: subjectId,
        unit,
        title: title.trim(),
        file_path: key,
        description: unit === 0 ? '[PRACTICE] Practice questions / PYQ' : '',
        is_practice: unit === 0,
      });

      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Could not upload note.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (note: Note) => {
    if (!confirm(`Delete “${note.title}”?`)) return;
    try {
      if (note.file_path && !note.file_path.startsWith('blob:')) {
        await deleteFileFromR2(note.file_path);
      }
      await DataService.deleteNote(note.id);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Could not delete note.');
    }
  };

  if (!authenticated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/admin/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
              <ArrowLeft className="h-4 w-4" /> Admin Dashboard
            </Link>
            <p className="apple-eyebrow">Clasy admin</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950">Notes Manager</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage 5-unit structured notes and preview them directly inside the app.
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="apple-primary-button">
            <Plus className="h-4 w-4" /> Upload Notes
          </button>
        </div>

        <div className="apple-card mt-7 flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-xs">
            <label className="apple-label">Branch</label>
            <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="apple-select w-full">
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.code} — {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:max-w-[180px]">
            <label className="apple-label">Semester</label>
            <select value={selectedSem} onChange={(e) => setSelectedSem(Number(e.target.value))} className="apple-select w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-zinc-500 sm:ml-auto">
            {notes.length} note{notes.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[2fr_1.2fr_100px_100px_120px] gap-4 border-b border-zinc-100 bg-zinc-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 md:grid">
            <span>Unit Note</span>
            <span>Subject</span>
            <span>Unit</span>
            <span>Added</span>
            <span className="text-right">Action</span>
          </div>
          {notes.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-zinc-500">No notes for this branch and semester.</div>
          ) : (
            notes.map((note) => {
              const fileName = note.file_path ? (note.file_path.split('/').pop() || `${note.title}.pdf`) : 'No PDF attached';
              return (
                <div 
                  key={note.id} 
                  className="grid gap-3 border-b border-zinc-100 px-5 py-4 last:border-0 md:grid-cols-[2fr_1.2fr_100px_100px_120px] md:items-center md:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900">{note.title}</p>
                      <p className="truncate text-xs text-zinc-400">{fileName}</p>
                    </div>
                  </div>

                  <span className="text-sm text-zinc-600 truncate">
                    {note.subject?.code || note.subject?.name}
                  </span>

                  <div>
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                      note.is_practice || note.unit === 0 || note.description?.includes('[PRACTICE]')
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {note.is_practice || note.unit === 0 || note.description?.includes('[PRACTICE]')
                        ? '📌 Practice'
                        : `Unit ${note.unit || 1}`}
                    </span>
                  </div>

                  <span className="text-xs text-zinc-400">{new Date(note.created_at).toLocaleDateString()}</span>

                  <div className="flex items-center justify-start gap-1.5 md:justify-end">
                    {note.file_path && (
                      <a
                        href={getNoteViewUrl(note.file_path, fileName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="apple-icon-button text-blue-600 hover:bg-blue-50"
                        title="Open PDF in new tab"
                      >
                        <BookOpen className="h-4 w-4" />
                      </a>
                    )}

                    {note.file_path && (
                      <a 
                        href={getNoteDownloadUrl(note.file_path, fileName)} 
                        download={fileName}
                        className="apple-icon-button" 
                        title="Download with Clasy watermark"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}

                    <button 
                      onClick={() => handleDelete(note)} 
                      className="apple-icon-button text-red-500 hover:bg-red-50" 
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* In-App Note Viewer Modal */}
      <NoteViewerModal
        note={viewingNote}
        isOpen={Boolean(viewingNote)}
        onClose={() => setViewingNote(null)}
      />

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px] sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="apple-eyebrow">Clasy admin</p>
                <h2 className="mt-1 text-xl font-semibold text-zinc-950">Upload Note</h2>
              </div>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="apple-icon-button">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="mt-6 space-y-4">
              <div>
                <label className="apple-label">Select subject (16 Subjects)</label>
                <select 
                  required 
                  value={subjectId} 
                  onChange={(e) => setSubjectId(e.target.value)} 
                  className="apple-select w-full"
                >
                  <option value="">Select a subject...</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} {subject.code ? `(${subject.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="apple-label">Unit / Section</label>
                <select
                  value={unit}
                  onChange={(e) => {
                    const u = Number(e.target.value);
                    setUnit(u);
                  }}
                  className="apple-select w-full"
                >
                  <option value={0}>📌 Practice Questions / PYQs (Pinned Chapter)</option>
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      Unit {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="apple-label">Title</label>
                <input 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder={unit === 0 ? "e.g. 2024 Sessional Exam PYQ" : "e.g. Unit 1: Programming Paradigms & C++ Basics"} 
                  className="apple-text-input" 
                />
              </div>

              <div>
                <label className="apple-label">Attach File <span className="font-normal text-zinc-400">(PDF or Images)</span></label>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-4 hover:bg-blue-50/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800">
                      {fileObject?.name || 'Choose PDF or image from device'}
                    </p>
                    <p className="text-xs text-zinc-400">Supports PDF, PNG, JPG, JPEG, WEBP (Up to 50MB)</p>
                  </div>
                  <input 
                    type="file" 
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.ppt,.pptx,.txt" 
                    className="sr-only" 
                    onChange={(e) => setFileObject(e.target.files?.[0] || null)} 
                  />
                </label>
              </div>

              <button disabled={uploading} className="apple-primary-button w-full justify-center disabled:opacity-60">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Save & Upload Document
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
