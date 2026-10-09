'use client';

import React, { useState, useMemo } from 'react';
import { ABES_SYLLABUS } from '@/lib/syllabus-data';
import { SyllabusSubject } from '@/lib/types';
import { getSubjectShortform } from '@/lib/data-service';
import { 
  X, 
  BookOpen, 
  Search, 
  GraduationCap, 
  Layers, 
  Bookmark, 
  ExternalLink,
  Download,
  FileText,
  Award,
  CheckCircle2
} from 'lucide-react';

interface SyllabusModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSemester?: number;
  initialSubjectId?: string;
  branchCode?: string;
}

const OFFICIAL_PDF_PATH = '/syllabus/ABES_BTech_2nd_Year_CSE_Syllabus_2026-27.pdf';

export const SyllabusModal: React.FC<SyllabusModalProps> = ({
  isOpen,
  onClose,
  initialSemester = 3,
  initialSubjectId,
  branchCode = 'CSE',
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(initialSemester);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'units' | 'pdf'>('units');

  // All 2nd year subjects for selected semester
  const semesterSubjects = useMemo(() => {
    return ABES_SYLLABUS.filter((s) => s.semester === selectedSemester);
  }, [selectedSemester]);

  const [selectedSubId, setSelectedSubId] = useState<string>(() => {
    if (initialSubjectId) {
      const found = ABES_SYLLABUS.find(
        (s) => s.id === initialSubjectId || s.code === initialSubjectId || getSubjectShortform(s) === getSubjectShortform(initialSubjectId)
      );
      if (found) return found.id;
    }
    return semesterSubjects[0]?.id || 's-25cs301';
  });

  // Sync when semester changes
  React.useEffect(() => {
    if (semesterSubjects.length > 0 && !semesterSubjects.some((s) => s.id === selectedSubId)) {
      setSelectedSubId(semesterSubjects[0].id);
    }
  }, [semesterSubjects, selectedSubId]);

  const currentSubject: SyllabusSubject = useMemo(() => {
    return ABES_SYLLABUS.find((s) => s.id === selectedSubId) || semesterSubjects[0] || ABES_SYLLABUS[0];
  }, [selectedSubId, semesterSubjects]);

  // Filter topics in current subject if search query present
  const filteredUnits = useMemo(() => {
    if (!currentSubject?.units) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentSubject.units;

    return currentSubject.units.map((unit) => {
      const matchName = unit.unitName.toLowerCase().includes(q);
      const matchingTopics = unit.topics.filter((t) => t.toLowerCase().includes(q));
      if (matchName || matchingTopics.length > 0) {
        return {
          ...unit,
          topics: matchName ? unit.topics : matchingTopics,
        };
      }
      return null;
    }).filter(Boolean) as typeof currentSubject.units;
  }, [currentSubject, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-2 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative flex flex-col w-full max-w-5xl h-[92vh] max-h-[95vh] rounded-[28px] bg-white shadow-2xl overflow-hidden border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/90 px-5 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="apple-eyebrow text-emerald-700">Official Evaluation Scheme</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  2nd Year (2026–27)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 truncate">
                ABES 2nd Year Academic Syllabus · {branchCode}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href={OFFICIAL_PDF_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-icon-button text-zinc-600 hover:text-emerald-700"
              title="Open full official PDF in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href={OFFICIAL_PDF_PATH}
              download="ABES_BTech_2nd_Year_CSE_Syllabus_2026-27.pdf"
              className="apple-icon-button text-zinc-600 hover:text-emerald-700"
              title="Download official PDF"
            >
              <Download className="h-4 w-4" />
            </a>
            <button 
              onClick={onClose}
              className="apple-icon-button"
              title="Close syllabus"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Top Navigation & View Switcher */}
        <div className="border-b border-zinc-100 bg-white px-5 py-3 sm:px-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* View Mode Toggle: Interactive Units vs Official PDF */}
            <div className="flex items-center rounded-2xl bg-zinc-100 p-1 border border-zinc-200/80">
              <button
                onClick={() => setViewMode('units')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === 'units'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-emerald-600" />
                Structured Units &amp; Topics
              </button>
              <button
                onClick={() => setViewMode('pdf')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === 'pdf'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                Official 70-Page PDF
              </button>
            </div>

            {viewMode === 'units' && (
              <div className="flex items-center gap-2">
                {/* Semester Tabs */}
                <button
                  onClick={() => setSelectedSemester(3)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    selectedSemester === 3
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  Semester 3 (3rd Sem)
                </button>
                <button
                  onClick={() => setSelectedSemester(4)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    selectedSemester === 4
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  Semester 4 (4th Sem)
                </button>
              </div>
            )}
          </div>

          {viewMode === 'units' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              {/* Subject Pills Slider */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
                {semesterSubjects.map((sub) => {
                  const short = getSubjectShortform(sub);
                  const isSelected = sub.id === currentSubject?.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubId(sub.id)}
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      <span>{short}</span>
                      {sub.credits && (
                        <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${isSelected ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                          {sub.credits}C
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Topic Search */}
              <div className="relative shrink-0 w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in syllabus..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-6">
          {viewMode === 'pdf' ? (
            <div className="h-full min-h-[500px] flex flex-col rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 text-white text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold">ABES B.Tech 2nd Year Evaluation Scheme &amp; Syllabus (2026–27)</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={OFFICIAL_PDF_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-semibold"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Fullscreen
                  </a>
                </div>
              </div>
              <iframe
                src={`${OFFICIAL_PDF_PATH}#toolbar=1&navpanes=0`}
                className="w-full flex-1 min-h-[500px] border-0"
                title="Official 2nd Year Syllabus PDF"
              />
            </div>
          ) : currentSubject ? (
            <div>
              {/* Subject Title Banner */}
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        {getSubjectShortform(currentSubject)}
                      </span>
                      {currentSubject.credits && (
                        <span className="rounded bg-emerald-200/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900">
                          {currentSubject.credits} Credits · 5 Units
                        </span>
                      )}
                      <span className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-[10px] font-bold text-zinc-700">
                        Total 100 Marks (CIA: 30 · External: 70)
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-zinc-950">
                      {currentSubject.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={OFFICIAL_PDF_PATH}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      <FileText className="h-3.5 w-3.5" /> Official PDF
                    </a>
                  </div>
                </div>
              </div>

              {/* 5 Units List */}
              <div className="mt-5 space-y-4">
                {filteredUnits.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-200 py-12 text-center text-zinc-400">
                    <BookOpen className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
                    <p className="text-sm font-semibold text-zinc-600">No matching topics found in this subject</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Try clearing your search query</p>
                  </div>
                ) : (
                  filteredUnits.map((unit) => (
                    <div 
                      key={unit.unitNumber}
                      className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm space-y-3 transition hover:border-emerald-300"
                    >
                      <div className="flex items-center gap-3 border-b border-zinc-100 pb-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 font-bold text-emerald-700 text-xs shrink-0">
                          U{unit.unitNumber}
                        </div>
                        <h4 className="text-sm font-bold text-zinc-950">
                          Unit {unit.unitNumber}: {unit.unitName}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {unit.topics.map((topic, idx) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-2 rounded-xl bg-zinc-50/70 p-2.5 border border-zinc-100 text-xs text-zinc-700"
                          >
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Practical Experiments / Lab Modules if applicable */}
              {currentSubject.experiments && currentSubject.experiments.length > 0 && (
                <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2 flex items-center gap-1.5">
                    <Bookmark className="h-3.5 w-3.5 text-emerald-600" /> Lab Experiments &amp; Practical Modules
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-600 pl-4 list-disc">
                    {currentSubject.experiments.map((exp, idx) => (
                      <li key={idx} className="leading-relaxed">{exp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes / Special Notice */}
              {currentSubject.notesNotice && (
                <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4">
                  <p className="text-xs text-amber-900 font-medium leading-relaxed">
                    💡 {currentSubject.notesNotice}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-zinc-100 bg-zinc-50/90 px-5 py-3 sm:px-6 gap-2">
          <p className="text-xs text-zinc-500">
            Autonomous Evaluation Scheme (Effective 2025–26 Onwards · Academic Year 2026–27)
          </p>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <a
              href={OFFICIAL_PDF_PATH}
              download="ABES_BTech_2nd_Year_CSE_Syllabus_2026-27.pdf"
              className="apple-secondary-button text-xs flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Download Full PDF
            </a>
            <button
              onClick={onClose}
              className="apple-primary-button text-xs bg-zinc-900 hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
